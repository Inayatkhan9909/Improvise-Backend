"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    instructorname: {
        type: String,
    },
    instructorprofile: {
        type: String
    },
    date: {
        type: Date,
        required: true,
    },
    timing: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    maxStudents: {
        type: Number,
        required: true,
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    category: {
        type: String,
        enum: ['Music', 'Arts', 'Sports', 'Technology', 'Language'],
        required: true,
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const Clsss = mongoose.model('Class', classSchema);
exports.default = Clsss;
