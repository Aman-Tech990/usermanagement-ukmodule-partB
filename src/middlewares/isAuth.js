import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const isAuth = async (req) => {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, "secret");
        if (!decoded) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}