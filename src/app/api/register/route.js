import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, "secret", { expiresIn: "7d" });
}

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                message: "All fields required!"
            }, { status: 400 });
        }

        if (name.length < 5) {
            return NextResponse.json({
                success: false,
                message: "Name must be at least 5 characters long."
            }, { status: 200 });
        }

        let validName = true;
        for (let ch of name) {
            if (
                !(ch >= '0' && ch <= '9') &&
                !(ch >= 'a' && ch <= 'z') &&
                !(ch >= 'A' && ch <= 'Z')
            ) {
                validName = false;
            }
        }
        if (!validName) {
            return NextResponse.json({
                success: false,
                message: "It must only contain alphanumeric characters"
            }, { status: 400 });
        }

        let validPassword = true;
        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                message: "Password must be atleast 8 chracters long"
            }, { status: 400 });
        }

        let upper = 0, lower = 0, num = 0, special = 0;
        for (const ch of password) {
            if (ch >= 'A' && ch <= 'Z') upper++;
            else if (ch >= 'a' && ch <= 'z') lower++;
            else if (ch >= '0' && ch <= '9') num++;
            else special++;
        }

        if (upper === 0) {
            return NextResponse.json({
                success: false,
                message: "Password must contain atleast one uppercase chracter"
            }, { status: 400 });
        }
        if (lower === 0) {
            return NextResponse.json({
                success: false,
                message: "Password must contain atleast one lowercase chracter"
            }, { status: 400 });
        }
        if (num === 0) {
            return NextResponse.json({
                success: false,
                message: "Password must contain atleast one number"
            }, { status: 400 });
        }
        if (special === 0) {
            return NextResponse.json({
                success: false,
                message: "Password must contain atleast one special chracter"
            }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (exists) {
            return NextResponse.json({
                success: false,
                message: "User already exists!"
            }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = generateToken(user.id);
        const response = NextResponse.json({
            success: true,
            message: "User created successfully!",
            user: user
        }, { status: 201 });

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