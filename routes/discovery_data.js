import express from "express";
import { getInternationalData, getKenyaData, createData, createKenyaData, createForecastKenya } from "../controllers/data.js";

const router = express.Router();

//Gets
router.get('/int_data', getInternationalData);
router.get('/kenya_data', getKenyaData);
router.get('/kenya_forecast', createForecastKenya);

//Run Scrappers
router.get('/run_scrapper', createData);
router.get('/run_scrapper_ke', createKenyaData);

export default router;