import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const response = NextResponse.json({
            success: true,
            message: "User logged out successfully!"
        }, { status: 200 });

        response.cookies.set("token", "", {
            httpOnly: true,
            maxAge: 0
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