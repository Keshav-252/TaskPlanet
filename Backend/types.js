const z=require("zod");

const UserSchema = z.object({
    email: z.string().email("Invalid email address"),
    username: z.string(),
    password: z.string().min(6)
});

module.exports=UserSchema;