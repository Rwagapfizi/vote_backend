const mongoose = require('mongoose');
// Apply cookie-parser middleware
// app.use(cookieParser());
const bcrypt = require('bcrypt');

const voterSchema = new mongoose.Schema({
	names: {
		type: String,
		required: [true, 'Names are required'],
		trim: true,
		validate: {
			validator: (value) => /^[A-Za-z\s]+$/.test(value),
			message: 'Names should contain only alphabetic characters.',
		},
	},
	nationalId: {
		type: String,
		required: [true, 'National ID is required'],
		trim: true,
		validate: {
			validator: (value) => /^\d{16}$/.test(value),
			message: 'National ID should be a 16-digit number.',
		},
	},
	address: {
		type: String,
		required: [true, 'Address is required'],
		trim: true,
	},
	phoneNumber: {
		type: String,
		required: [true, "Phone number is required"],
		trim: true,
		validate: {
			validator: (value) => /^[0-9]{10}$/.test(value),
			message: 'Phone number should be a valid 10-digit mobile number.',
		},
	},
	email: {
		type: String,
		required: [true, "Email address is required"],
		trim: true,
		unique: true,
		validate: {
			validator: (value) => /\S+@\S+\.\S+/.test(value),
			message: 'Email address should be valid.',
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: [6, "Password must be at least 6 characters long"],
		maxlength: [100, "Password must not exceed 100 characters long"]
	},
	hasVoted: {
		type: Boolean,
		default: false
	}
});

// Hash the password before saving the voter
voterSchema.pre('save', async function (next) {
	const voter = this;

	// Generate a salt
	const salt = await bcrypt.genSalt(10);

	// Hash the password with the salt
	const hashedPassword = await bcrypt.hash(voter.password, salt);

	// Replace the plain-text password with the hashed password
	voter.password = hashedPassword;

	next();
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
