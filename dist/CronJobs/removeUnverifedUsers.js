"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const firebaseConfig_1 = require("../Config/firebaseConfig");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const removeUnverifiedUsersJob = () => {
    node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Running cron job: Removing unverified users');
        const unverifiedUsers = yield UserModel_1.default.find({
            isVerified: false,
            createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // Check for users created more than 3 days ago
        });
        for (const user of unverifiedUsers) {
            try {
                yield firebaseConfig_1.firebaseAuth.deleteUser(user.firebaseUid); // Remove from Firebase
                yield user.deleteOne(); // Remove from MongoDB
            }
            catch (error) {
                console.error(`Failed to remove user ${user.email}:`, error);
            }
        }
        console.log(`${unverifiedUsers.length} unverified users removed.`);
    }));
};
exports.default = removeUnverifiedUsersJob;
