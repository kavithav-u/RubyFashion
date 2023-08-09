const express = require('express');
const searchRouter = express.Router();
const searchController= require("../controller/searchController");
const usermiddlewear = require("../middlewear/usermiddlewear")

searchRouter.get("/", usermiddlewear.userlogin,searchController.querySearch);


module.exports = searchRouter;