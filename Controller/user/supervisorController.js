const SupervisorSchema = require("../../model/user/supervisorSchema");
const {body, validationResult} = require('express-validator');

exports.registerSupervisor = async (req, res) => {
    try {
        // Validation middleware
        const validationChecks = [
            body('phone').isMobilePhone().withMessage('Invalid phone number'),
            body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
            body('companyName').notEmpty().withMessage('Company name is required')
        ];

        for (const validationCheck of validationChecks) {
            await validationCheck.run(req);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({error: errorMessages[0]});
        }

        const {phone, password, imageUrl, companyName,surveyors} = req.body;

        // Check if the supervisor already exists
        const existingSupervisor = await SupervisorSchema.findOne({phone});

        if (existingSupervisor) {
            return res.status(400).json({error: 'Supervisor already exists'});
        }

        // Create a new supervisor
        const supervisor = new SupervisorSchema({
            imageUrl,
            password,
            phone,
            companyName,
            surveyors
        });

        // Save the supervisor to the database
        await supervisor.save();
        res.status(201).json({message: 'Supervisor registered successfully', data: supervisor});

    } catch (error) {
        console.error('Error registering supervisor:', error);
        res.status(500).json({error: 'Internal Server Error :' + error});
    }
};


exports.loginSupervisor = async (req, res) => {
    try {
        const {phone, password} = req.body;
        const filter = {
            "phone": phone
        };

        const supervisor = await SupervisorSchema.findOne(filter);

        if (!supervisor) {
            return res.status(401).json({error: 'Supervisor not exists'});
        }
        if (supervisor.password !== password) {
            return res.status(401).json({error: 'Invalid credentials  body= ' + phone + password});
        }
        res.status(200).json({message: 'Login successful', data: supervisor});

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({error: 'Internal Server Error' + error});
    }
}


exports.allSupervisor = async (req, res) => {
    try {
        const supervisors = await SupervisorSchema.find();
        res.status(200).json({data: supervisors});
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({error: 'Internal Server Error' + error});
    }
}

exports.supervisorUpdate = async (req, res) => {
    try {
        // Extract supervisor ID from request parameters
        const supervisorId = req.params.id


        // Validation checks (modify as needed for update operation)
        const validationChecks = [
            body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
            body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            body('companyName').optional().notEmpty().withMessage('Company name is required')
        ];

        // Run validation checks
        for (const validationCheck of validationChecks) {
            await validationCheck.run(req);
        }

        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({ error: errorMessages[0] });
        }

        // Update supervisor
        const updateData = req.body;
        const updatedSupervisor = await SupervisorSchema.findByIdAndUpdate(supervisorId, updateData, { new: true });

        if (!updatedSupervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        res.status(200).json({ message: 'Supervisor updated successfully', data: updatedSupervisor });

    } catch (error) {
        console.error('Error updating supervisor:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteSupervisor = (req, res) => {
    // Validate if the ID is present
    if (!req.params.id) {
        return res.status(400).send({message: "Supervisor ID is required."});
    }

    SupervisorSchema.findById(req.params.id)
        .then((supervisor) => {
            // Check if the supervisor exists
            if (!supervisor) {
                return res.status(404).send({message: "Supervisor not found with ID: " + req.params.id});
            }

            return SupervisorSchema.findByIdAndDelete(req.params.id);
        })
        .then((result) => {
            return res.status(200).send({data: result});
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({message: "Error occurred while deleting the supervisor."});
        });
}

