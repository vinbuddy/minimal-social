"use client";
import BackButton from "@/components/BackButton";
import CommentForm from "@/components/Comment/CommentForm";
import MainLayout from "@/components/MainLayout";
import PostDetail from "@/components/Post/PostDetail";
import useAuthStore from "@/hooks/store/useAuthStore";
import { IPost } from "@/types/post";
import { Avatar, Spinner, User } from "@nextui-org/react";

import useSWR from "swr";

export default function PostPage({ params }: { params: { id: string } }) {
    const { data, error, isLoading } = useSWR(`/post/${params.id}`);

    const post = data?.data as IPost;

    return (
        <MainLayout>
            {isLoading && (
                <div className="h-screen w-full flex justify-center items-center">
                    <Spinner />
                </div>
            )}
            {!isLoading && error && <div className="flex justify-center">{error?.message}</div>}
            {!isLoading && !error && post && (
                <div className="flex justify-center w-full">
                    <div className="w-[630px]">
                        <header className="sticky h-[80px] top-0 z-10 p-4 flex justify-between items-center bg-background">
                            <BackButton />

                            <User
                                className="bg-content2 rounded-full py-1.5 ps-2 pe-3"
                                name={post?.postBy?.username}
                                avatarProps={{
                                    size: "sm",
                                    src: post?.postBy?.photo,
                                }}
                            />
                        </header>

                        <main className="px-4 pb-4 mt-4">
                            <PostDetail post={post} />

                            <div className="mt-4 sticky top-[80px] z-[1] py-3">
                                <CommentForm />
                            </div>

                            <div className="min-h-[800px]"></div>
                        </main>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
