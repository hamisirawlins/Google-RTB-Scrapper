import DataCapsule from "../models/data.js"
import fs from "fs";
import kenya_data from "./../assets/kenya_data.js";

//Scrapper Imports
import puppeteer from "puppeteer";
import path from "path";
import { parse } from "csv-parse";

//Controllers
export const getInternationalData = async (req, res) => {
    try {
        const int_data = await DataCapsule.findOne({ tag: "international" })
        res.status(200).json(int_data);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getKenyaData = async (req, res) => {
    const page = parseInt(req.query.page)
    const per_page = parseInt(req.query.per_page)

    const startIndex = (page - 1) * per_page;
    const endIndex = page * per_page;

    try {
        const int_data = await DataCapsule.findOne({ tag: "kenya" }).then((response) => {
            //Paginate
            return {
                "_id": response._id,
                "created_at": response.created_at,
                "tag": response.tag,
                "discovery_data": response.discovery_data.slice(startIndex, endIndex),
                "next_page": page + 1,
                "per_page": per_page,
                "previous_page": page - 1,
            }
        })
        res.status(200).json(int_data);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createData = async (req, res) => {
    try {
        //App Download URL
        const downloadPath = path.resolve("./download");

        //Clean Up File system
        if (fs.existsSync("./download")) {
            console.info('\x1b[33m Cleaning file system ...  \x1b[0m')
            fs.rmSync("./download", { recursive: true, force: true });
            console.info('\x1b[33m File system clean, Scrapper System Running  \x1b[0m')
        } else {
            console.info('\x1b[33m File System clean, Scrapper System Running \x1b[0m')
        }

        //Download CSV Exports from Page
        await download()
        async function download() {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const client = await page.target().createCDPSession()

            //Parser and Webpage Interaction
            await page.goto(
                "https://realtimebidding.google.com/291390653#MARKETPLACE/MarketplaceDiscoveryPlace:marketplaceDiscovery"
            );
            await page.waitForSelector('input[type="email"]');
            await page.type('input[type="email"]', process.env.GUSER);
            await Promise.all([
                page.waitForNavigation(),
                await page.keyboard.press("Enter"),
            ])
            await page.waitForSelector('input[type="password"]', { visible: true });
            await page.type('input[type="password"]', process.env.GPASSWORD);
            await Promise.all([
                page.waitForNavigation(),
                await page.keyboard.press("Enter"),
            ]);
            await page.waitForNetworkIdle();
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath
            });
            // Download Data
            await page.click('export-button')
            await page.click('material-list-item.customReport.sitesAndApps.item._ngcontent-MARKETPLACE-4._nghost-MARKETPLACE-6')
            console.info('\x1b[33m Awaiting Google Export . . .  \x1b[0m')

            //Watch download folder creation
            let download_status = setInterval(function () {
                if (!fs.existsSync('./download')) {
                    console.log("Downloading . . .")
                }
                else {
                    clearInterval(download_status);
                    checkData()
                }
            }, 4 * 1000);
        }

        //Check data exists within download directory
        async function checkData() {
            if (fs.readdirSync('./download').length !== 0) {
                console.info('\x1b[33m Data downloaded, parsing data to JSON ...  \x1b[0m')

                //Collect Downloaded CSV File and Parse
                let file = fs.readdirSync(downloadPath)
                await parseIntData(file)
            } else {
                console.info('\x1b[33m Error in data download. Restart parser \x1b[0m')
                return process.exit();
            }
        }

        //JSONify CSV Data
        async function parseIntData(file) {
            let csv_data = [];
            fs.createReadStream(`download/${file}`).pipe(parse({
                delimiter: ",", from_line: 5, columns: true,
            })).on("data", function (row) {
                csv_data.push(row);
            })
                .on("error", function (error) {
                    console.log(error.message);
                })
                .on("end", function () {
                    storeData(csv_data)
                });
            ;
        }
        //Store Data
        async function storeData(values) {
            await DataCapsule.findOneAndDelete({ tag: "international" })
            const newData = new DataCapsule({ tag: "international", discovery_data: values })
            try {
                await newData.save()
                res.status(201).json(newData)
                console.log("international Data Updated Successfully")
            } catch (error) {
                res.status(409).json({ message: error.message })
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

export const createKenyaData = async (req, res) => {
    try {
        //App Download URL
        const downloadPath = path.resolve("./download");

        //Clean Up File system
        if (fs.existsSync("./download")) {
            console.info('\x1b[33m Cleaning file system ...  \x1b[0m')
            fs.rmSync("./download", { recursive: true, force: true });
            console.info('\x1b[33m File system clean, running scrapper  \x1b[0m')
        } else {
            console.info('\x1b[33m File System clean, running scrapper \x1b[0m')
        }

        //Download CSV Exports from Page
        await download()
        async function download() {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);
            const client = await page.target().createCDPSession()

            //Parser and Webpage Interaction
            await page.goto(
                "https://realtimebidding.google.com/291390653#MARKETPLACE/MarketplaceDiscoveryPlace:marketplaceDiscovery"
            );
            await page.waitForSelector('input[type="email"]');
            await page.type('input[type="email"]', process.env.GUSER);
            await Promise.all([
                page.waitForNavigation(),
                await page.keyboard.press("Enter"),
            ])
            await page.waitForSelector('input[type="password"]', { visible: true });
            await page.type('input[type="password"]', process.env.GPASSWORD);
            await Promise.all([
                page.waitForNavigation(),
                await page.keyboard.press("Enter"),
            ]);
            await page.waitForNetworkIdle();
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath
            });
            //Kenya Search
            await page.click('material-icon.filter-icon')
            await page.type('input.search-box', 'user', { delay: 300 });
            await Promise.all([
                await page.keyboard.press("Enter"),
            ]);
            await Promise.all([
                await page.type('input.input', 'k'),
                await page.type('input.input', 'e'),
                await page.type('input.input', 'n')
            ]);
            await page.click('div.icon-container');
            const [button] = await page.$x("//material-button[contains(., 'Apply')]")
            if (button) {
                await Promise.all([await button.click()])
                await page.screenshot({ fullPage: true, path: "Png.png" })
            }

            // Download Data
            await page.click('export-button')
            await page.click('material-list-item.customReport.sitesAndApps.item._ngcontent-MARKETPLACE-4._nghost-MARKETPLACE-6')
            console.info('\x1b[33m Awaiting Google Export . . .  \x1b[0m')

            //Watch download folder creation
            let download_status = setInterval(function () {
                if (!fs.existsSync('./download')) {
                    console.log("Downloading . . .")
                }
                else {
                    clearInterval(download_status);
                    checkData()
                }
            }, 4 * 1000);
        }

        //Check data exists within download directory
        async function checkData() {
            if (fs.readdirSync('./download').length !== 0) {
                console.info('\x1b[33m Data downloaded, parsing data to JSON ...  \x1b[0m')

                //Collect Downloaded CSV File and Parse
                let file = fs.readdirSync(downloadPath)
                await parseIntData(file)
            } else {
                console.info('\x1b[33m Error in data download. Restart parser \x1b[0m')
                return process.exit();
            }
        }

        //JSONify CSV Data
        async function parseIntData(file) {
            let csv_data = [];
            fs.createReadStream(`download/${file}`).pipe(parse({
                delimiter: ",", from_line: 7, columns: true,
            })).on("data", function (row) {
                csv_data.push(row);
            })
                .on("error", function (error) {
                    console.log(error.message);
                })
                .on("end", function () {
                    storeData(csv_data)
                });
            ;
        }
        //Store Data
        async function storeData(values) {
            await DataCapsule.findOneAndDelete({ tag: "kenya" })
            const newData = new DataCapsule({ tag: "kenya", discovery_data: values })
            try {
                await newData.save()
                res.status(201).json(newData)
                console.log("Kenya Data Updated Successfully")
            } catch (error) {
                res.status(409).json({ message: error.message })
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getForecastKenya = async (req, res) => {
    res.json(kenya_data)
}