const { model } = require("mongoose");
const User = require("../model/user");

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select("-password -createdAt");
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    deleteFakeUser: async (req, res) => {
        try {
            let user = User.findById(req.query.id);
            if (user) {
                return res.status(200).json("Deleted");
            } else {
                return res.status(400).json("User not found");
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
};

module.exports = userController;
