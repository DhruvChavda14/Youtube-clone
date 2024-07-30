import jwt from "jsonwebtoken"
import  users from '../models/auth.js'
export const login = async(req,res)=>{
    const {email}=req.body;
      console.log(email);
    try {
        const existingUser= await users.findOne({email});
        if (!existingUser) {
            try {
                const newUser = await users.create({ email });

                const token = jwt.sign({
                    email: newUser.email, id: newUser._id
                }, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                });

                res.status(200).json({
                    result: {
                        _id: newUser._id,
                        email: newUser.email,
                        name: newUser.name, // Ensure to include name if it's part of newUser schema
                        points: newUser.points, // Include points in the response
                    },
                    token,
                });
            } catch (error) {
                res.status(500).json({ mess: "Something went wrong..." }); // Corrected typo
            }
        }else{

            const token=jwt.sign({
                email:existingUser.email, id:existingUser._id
            },process.env.JWT_SECRET,{
                expiresIn:"1h"
            })
            res.status(200).json({result:existingUser,token})
        }
    } catch (error) {
        res.status(500).json({mess:"something wents wrong..."})
    }
}


export const getUserPoints = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ points: user.points });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user points', error });
    }
};

