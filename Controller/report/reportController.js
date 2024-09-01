const Report = require('../../model/report/reportSchema'); // Replace with the correct path
const mongoose = require('mongoose');
const Supervisor = require('../../model/user/supervisorSchema'); // Adjust the path to your Supervisor model
const Surveyor = require('../../model/user/surveyorSchema'); // Adjust the path to your Surveyor model

function checkIsIdsValid(id) {
    return !mongoose.Types.ObjectId.isValid(id);
}
exports.createReport = async (req, res) => {
    try {
        const { fields, supervisorId, surveyorId } = req.body;
        // Log the request body for debugging purposes
        console.log("Request Body:", JSON.stringify(req.body, null, 2));
        // Check if supervisorId and surveyorId exist in their collections
        const supervisorExists = await Supervisor.findById(supervisorId);
        if (!supervisorExists) {
            return res.status(404).json({ error: `Supervisor not found with ID ${supervisorId}.` });
        }

        // Validate surveyorId if it is provided
        if (surveyorId && checkIsIdsValid(surveyorId)) {
            return res.status(400).json({ error: 'Invalid Surveyor ID' });
        }

    

        const report = new Report({
            ...req.body,
            fields // Ensure fields are correctly passed
        });
        await report.save();

        res.status(201).json({ message: 'Report created successfully', data: report });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
};



exports.updateReport = async (req, res) => {
    try {
        const { reportId } = req.params; // Assuming the report ID is passed as a URL parameter
        const { fields, supervisorId, surveyorId } = req.body;

        // Validate supervisorId
        if (supervisorId && checkIsIdsValid(supervisorId)) {
            return res.status(400).json({ error: 'Invalid Supervisor ID' });
        }

        // Check if the supervisor exists
        const supervisorExists = await Supervisor.findById(supervisorId);
        if (!supervisorExists) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        // Validate surveyorId if provided
        if (surveyorId && checkIsIdsValid(surveyorId)) {
            return res.status(400).json({ error: 'Invalid Surveyor ID' });
        }

        // Find the report by ID and update it
        const report = await Report.findByIdAndUpdate(reportId, {
            $set: { ...req.body, fields } // Ensure fields are correctly updated
        }, { new: true }); // {new: true} returns the updated document

        if (!report) {
            return res.status(404).json({ error: 'Report not found.' });
        }

        res.status(200).json({ message: 'Report updated successfully', data: report });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        await Report.findByIdAndDelete(reportId);
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
};

exports.getReportsBySupervisorAndMonth = async (req, res) => {
    try {
        const supervisorId = req.params.supervisorId;
        const month = parseInt(req.params.month);
        const year = parseInt(req.params.year);

        if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
            return res.status(400).json({ error: 'Invalid supervisorId.' });
        }

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid month. Must be between 1 and 12.' });
        }

        if (!year) {
            return res.status(400).json({ error: 'Invalid year.' });
        }

        const supervisorExists = await Supervisor.findById(supervisorId);
        if (!supervisorExists) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const reports = await Report.find({
            supervisorId,
            createdAt: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            }
        }).populate('surveyorId');

        res.status(200).json({ data: reports });

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
};

exports.getReportsAll = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json({ data: reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
};

exports.getReportsBySurveyorAndMonth = async (req, res) => {
    try {
        const surveyorId = req.params.surveyorId;
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);

        if (!mongoose.Types.ObjectId.isValid(surveyorId)) {
            return res.status(400).json({ error: 'Invalid surveyorId.' });
        }

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid month. Must be between 1 and 12.' });
        }

        if (!year) {
            return res.status(400).json({ error: 'Invalid year.' });
        }

        const surveyorExists = await Surveyor.findById(surveyorId);
        if (!surveyorExists) {
            return res.status(404).json({ error: 'Surveyor not found.' });
        }

        const reports = await Report.find({
            surveyorId,
            createdAt: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            }
        }).populate('surveyorId');

        res.status(200).json({ data: reports });

    } catch (error) {
        console.error('Error in getReportsBySurveyorAndMonth:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
};
