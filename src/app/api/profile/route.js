import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
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
        const user = await isAuth(req);

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access!"
            }, { status: 401 });
        }

        const formData = await req.formData();

        const name = formData.get("name");
        const profilePicture = formData.get("profilePicture");

        const data = {};

        if (name) {
            data.name = name;
        }

        if (profilePicture && profilePicture instanceof File) {
            if (profilePicture.size > 2 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: "Profile picture must be under 2MB!"
                }, { status: 400 });
            }

            if (!["image/jpeg", "image/png", "image/webp"].includes(profilePicture.type)) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid image format!"
                }, { status: 400 });
            }
        }

        if (profilePicture && profilePicture instanceof File) {
            const buffer = Buffer.from(await profilePicture.arrayBuffer());

            const base64Image = `data:${profilePicture.type};base64,${buffer.toString("base64")}`;

            const uploadedImage = await cloudinary.uploader.upload(base64Image, {
                folder: "profiles"
            });

            data.profilePicture = uploadedImage.secure_url;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({
                success: false,
                message: "Atleast one field required for profile update!"
            }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data
        });

        const { password: _, ...safeUser } = updatedUser;

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully!",
            user: safeUser
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}