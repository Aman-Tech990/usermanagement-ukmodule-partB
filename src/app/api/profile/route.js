import { isAuth } from "@/middlewares/isAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const user = await isAuth(req);

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access!"
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: "User profile fetched successfully!",
            user: user
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}