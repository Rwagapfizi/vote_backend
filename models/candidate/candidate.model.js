const mongoose = require('mongoose');
// Apply cookie-parser middleware
// app.use(cookieParser());

const candidateSchema = new mongoose.Schema({
    names: {
        type: String,
        required: [true, 'Candidate names are required'],
        trim: true,
        validate: {
			validator: (value) => /^[A-Za-z\s]+$/.test(value),
			message: 'Candidate names should contain only alphabetic characters and spaces.',
		},
    },
    nationalID: {
        type: String,
        required: [true, 'National ID is required'],
        unique: true,
        trim: true,
        validate: {
			validator: (value) => /^\d{16}$/.test(value),
			message: 'National ID should be a 16-digit number.',
		},
    },
    profilePicture: {
        type: String,
        required: [true, 'Profile picture URL is required']
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: 'Invalid gender'
        },
        required: [true, 'Gender is required']
    },
    missionStatement: {
        type: String,
        required: [true, 'Mission statement is required'],
        minlength: [5, 'Mission statement must be at least 5 characters long'],
        maxlength: [500, 'Mission statement cannot exceed 500 characters']
    },
    voteCounts: {
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
