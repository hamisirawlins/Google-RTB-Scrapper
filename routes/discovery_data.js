import express from "express";
import { getInternationalData, getKenyaData, createData, createKenyaData, getForecastKenya, getCountries } from "../controllers/data.js";

const router = express.Router();

//Gets
router.get('/int_data', getInternationalData);
router.get('/kenya_data', getKenyaData);
router.get('/kenya_forecast', getForecastKenya);
router.get('/countries', getCountries);

//Run Scrappers
router.get('/run_scrapper', createData);
router.get('/run_scrapper_ke', createKenyaData);

export default router;