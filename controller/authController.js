const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
let refreshTokens = [];

const authControler = {
    //REGISTER
    registerUser: async (req, res) => {
        try {
            let userName = req.body.userName;
            let password = req.body.password;
            if (!userName || !password) {
                return res.status(500).json({
                    errCode: 1,
                    errMessage: "Missing data",
                });
            }

            const checkUserName = await User.findOne({ userName: userName });
            if (checkUserName)
                return res.status(500).json({
                    errCode: 2,
                    errMessage: "Username exist",
                });
            else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(password, salt);
                const newUser = new User({
                    userName: userName,
                    password: hashed,
                });
                const save = await newUser.save();
                return res.status(200).json(save);
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    //GENERATEACCESSTOKEN
    generateAccessToken: (user) => {
        //Tạo accsessToken với key là process.env.JWT_ACCESS_KEY, hết hạn trong 10 phút
        const accessToken = jwt.sign(
            {
                id: user.id,
                admin: user.admin,
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "10m" }
        );
        return accessToken;
    },

    //GENERATEREFRESHTOKEN
    generateRefreshToken: (user) => {
        //Tạo refreshToken với key là process.env.JWT_REFRESH_KEY, hết hạn trong 7 ngày
        const refreshToken = jwt.sign(
            {
                id: user.id,
                admin: user.admin,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "7d" }
        );
        return refreshToken;
    },

    //LOGIN
    login: async (req, res) => {
        try {
            let userName = req.body.userName;
            let password = req.body.password;

            //Bắt lỗi không truyền dữ liệu
            if (!userName || !password) {
                return res.status(500).json({
                    errCode: 1,
                    errMessage: "Missing data",
                });
            }

            const user = await User.findOne({ userName: userName });

            //Bắt lỗi không có tài khoản trong DB
            if (!user) {
                return res.status(404).json({
                    errCode: 2,
                    errMessage: "Wrong Username",
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                const accessToken = authControler.generateAccessToken(user);
                const refreshToken = authControler.generateRefreshToken(user);

                //Lưu trữ refreshToken vào 1 mảng (Thực tế nên là DB)
                refreshTokens.push(refreshToken);
                //Đính refreshToken vào trong cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    path: "/",
                    secure: false,
                });
                user.password = "123aa";
                return res.status(200).json({ user, accessToken });
            } else {
                //Bắt lỗi sai password
                return res.status(500).json({
                    errCode: 3,
                    errMessage: "Wrong Password",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    //REFRESH TOKEN
    refreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json("You're not authenticated");
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                console.log(err);
            }
            refreshTokens = refreshTokens.filter(
                (token) => token !== refreshToken
            );
            const newAccessToken = authControler.generateAccessToken(user);
            const newRefreshToke = authControler.generateRefreshToken(user);
            refreshTokens.push(newRefreshToke);
            res.cookie("refreshToken", newRefreshToke, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
                secure: false,
            });
            return res.status(200).json(newAccessToken);
        });
    },

    //LOGOUT
    logout: async (req, res) => {
        try {
            res.clearCookie("refreshToken");
            refreshTokens = refreshTokens.filter(
                (token) => token !== req.cookies.refreshToken
            );
            return res.status(200).json("Logged out!");
        } catch (error) {
            return res.status(500).json(error);
        }
    },
};

module.exports = authControler;
