import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async (req,res)=>{
  //get user details from frontend
    // validation - not empty
    // check if user already exists : username, email
    // check for images check for avatar
    // upload them to cloudinary 
    // create user object- create entry in db
    // remove password and refresh token fields from response
    // check for user creation
    // return res


    //get user details from frontend
    const {fullName,email,username,password} = req.body
    console.log("Email is : ",email);
    console.log("Password is : ",password);

    // validation - not empty
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }

     // check if user already exists : username, email
    const existedUser = User.findOne(
        {
            $or: [{username},{email}]
        }
    )
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }

    // check for images check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }


        // upload them to cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }


     // create user object- create entry in db
    const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

        // remove password and refresh token fields from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

        // check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User egisered successfully")
    )

})

export {
    registerUser,
}