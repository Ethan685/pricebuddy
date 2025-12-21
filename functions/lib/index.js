"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPriceAlerts = exports.api = void 0;
var api_1 = require("./api");
Object.defineProperty(exports, "api", { enumerable: true, get: function () { return api_1.api; } });
var checkPriceAlerts_1 = require("./scheduled/checkPriceAlerts");
Object.defineProperty(exports, "checkPriceAlerts", { enumerable: true, get: function () { return checkPriceAlerts_1.checkPriceAlerts; } });
