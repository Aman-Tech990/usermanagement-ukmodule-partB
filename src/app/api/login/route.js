import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, "secret", { expiresIn: "7d" });
}

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "All fields required!"
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid email or password!"
            }, { status: 400 });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return NextResponse.json({
                success: false,
                message: "Invalid email or password!"
            }, { status: 400 });
        }

        const token = generateToken(user.id);
        const response = NextResponse.json({
            success: true,
            message: "User loggedin successfully!",
            user: user
        }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return response;
    } catch (error) {
        console.log(error.message);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}