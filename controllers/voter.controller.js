const express = require('express')
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Voter = require('../models/voter/voter.model');
const Candidate = require('../models/candidate/candidate.model');
// Apply cookie-parser middleware
app.use(cookieParser());
const secretKey = process.env.JWT_SECRET_KEY;

async function registerVoter(req, res) {
    // #swagger.tags = ['Voter']
    // #swagger.description = 'Endpoint to register a voter'
    const {
        names,
        nationalId,
        address,
        phoneNumber,
        email,
        password
    } = req.body;
    try {

        // Check if the admin with the given national ID already exists
        const existingVoter = await Voter.findOne({
            $or: [{ email }, { nationalID }, { phoneNumber }]
        });
        if (existingVoter) {
            return res.status(409).json({ message: 'Candidate with the provided national ID already exists' });
        }
        const voter = new Voter({
            names,
            nationalId,
            address,
            phoneNumber,
            email,
            password,
        });

        await voter.validate();

        const savedVoter = await voter.save();

        res.status(201).json({ message: 'Registration successful', voter: savedVoter });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function loginVoter(req, res) {
    // #swagger.tags = ['Voter']
    // #swagger.description = 'Endpoint to login a voter'
    const {
        email,
        password
    } = req.body;
    try {

        const voter = await Voter.findOne({ email });

        // Check if the voter exists
        if (!voter) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Voter not found/Invalid email',
            });
        }

        // Validate the password
        const validPassword = await bcrypt.compare(password, voter.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid password',
            });
        }

        const token = jwt.sign({ voterId: voter._id }, secretKey, {
            expiresIn: '2h',
        });
        // Set the token as a cookie
        res.cookie('token', "Bearer " + token, {
            httpOnly: true, maxAge: 24 * 60 * 60 * 1000
        });
        // res.status(201).header('Authorization', `Bearer ${token}`).json({ message: `${voter.names} logged in successful`, token });
        // Respond with success message
        res.json({
            success: true,
            status: 200,
            message: 'Voter login successful',
            data: voter,
            token
        });
        // res.status(201).json({ , token });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
}

// async function voteForCandidate(req, res) {
//     // #swagger.name = 'Vote for Candidate'
//     // #swagger.tags = ['Voter']
//     // #swagger.description = 'Endpoint to vote for a candidate'
//     try {
//         console.log(req.headers.authorization);
//         const token = req.headers.authorization.split(' ')[1]; // Assuming the token is provided in the authorization header
//         if (!token) {
//             return res.status(401).json({ message: 'Unauthorized: Voter not logged in' });
//         }
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

//         const voterEmail = decodedToken.email; // Extracting the email from the decoded token

//         // Find the candidate by the provided candidate national ID
//         const candidate = await Candidate.findOne({ candidateNationalID });
//         if (!candidate) {
//             return res.status(404).json({ message: 'Candidate not found' });
//         }

//         // Check if the voter with the given email has already voted
//         const voter = await Voter.findOne({ email: voterEmail });
//         if (voter && voter.hasVoted) {
//             return res.status(403).json({ message: 'You have already voted' });
//         }

//         // Increase the vote count for the selected candidate
//         candidate.voteCounts += 1;
//         await candidate.save();

//         // Update the voter's voting status
//         if (voter) {
//             voter.hasVoted = true;
//             await voter.save();
//         } else {
//             // If the voter doesn't exist, create a new voter and mark them as voted
//             await Voter.create({ email: voterEmail, hasVoted: true });
//         }

//         // Get the updated vote counts for all candidates
//         const candidates = await Candidate.find({}, 'names voteCounts');

//         res.status(200).json({ message: 'Vote cast successfully', candidates });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

const voteForCandidate = async (req, res) => {
    // #swagger.tags = ['Voter']
    // #swagger.description = 'Endpoint to vote for a candidate'
    try {
        // Get the candidate ID from the request body
        const { candidateId } = req.body;

        // Get the voter's ID from the authenticated user (token in cookie)
        const voterId = req.user && req.user._id;

        if (!voterId) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Unauthorized. Please log in to vote.',
            });
        }

        // Check if the voter has already voted
        const voter = await Voter.findById(voterId);
        if (!voter) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Voter not found',
            });
        }

        if (voter.hasVoted) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: 'You have already voted',
            });
        }

        // Increase the vote count for the candidate
        const candidate = await Candidate.findByIdAndUpdate(
            candidateId,
            { $inc: { voteCount: 1 } },
            { new: true }
        );

        // Mark the voter as voted
        voter.hasVoted = true;
        await voter.save();

        // Respond with success message and updated vote count
        res.json({
            success: true,
            status: 200,
            message: 'Vote recorded successfully',
            candidate: {
                _id: candidate._id,
                name: candidate.name,
                voteCount: candidate.voteCount,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

const getVoterData = async (req, res) => {
    // #swagger.tags = ['Voter']
    // #swagger.description = 'Endpoint to get logged in voter's data'
    try {
        // Get the voter's ID from the authenticated user (token in cookie)
        const voterId = req.user || req.user._id;

        if (!voterId) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Unauthorized. Please log in.',
            });
        }

        // Retrieve the voter data
        const voter = await Voter.findById(voterId);

        if (!voter) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Voter not found',
            });
        }

        // Respond with the voter data
        res.json({
            success: true,
            status: 200,
            data: voter,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

function logout(req, res) {
    // #swagger.tags = ['Voter']
    // #swagger.description = 'Endpoint to logout a voter'
    try {
        // Generate a new token with a short expiry time (5 seconds in this example)
        const newToken = jwt.sign({ email: req.user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '5s' });

        // Send the new token to the client-side
        res.status(200).json({ message: 'Logout successful', token: newToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    registerVoter,
    loginVoter,
    voteForCandidate,
    logout,
    getVoterData
};
