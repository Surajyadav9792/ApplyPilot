const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
      required: true,
        unique:true,
        trim:true
    },
    password:{
           type:String,
          required: true,
           unique:true,
           minlength:6
        
    },
    username:{
          type:String,
          required: true,
          maxlength: 100
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String
    },
    otpExpiry:{
        type:Date
    }
})


userSchema.pre("save", async function () {
    try {
        if (!this.isModified("password")) {
            return;
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
const User=mongoose.model('User',userSchema);
module.exports=User;