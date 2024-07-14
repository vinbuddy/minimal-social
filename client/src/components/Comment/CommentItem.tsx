import { HeartIcon } from "@/assets/icons";
import { Avatar, Button } from "@nextui-org/react";
import { ChevronDownIcon, EllipsisIcon } from "lucide-react";

export default function CommentItem() {
    return (
        <div className="flex group">
            <section>
                <Avatar
                    src="https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/dfa55850791ee685fa391df20716cb58.jpeg?lk3s=a5d48078&nonce=67179&refresh_token=fc384e3dbc2cf6170ee534428a9186ce&x-expires=1721055600&x-signature=s9jW%2Bx80qwD6X63BzXtKU6aqbbY%3D&shp=a5d48078&shcp=81f88b70"
                    size="md"
                />
            </section>
            <section className="ms-4 flex-1 max-w-full overflow-hidden">
                <div className="flex items-start justify-between">
                    <h4 className="text-sm">Vermon</h4>
                </div>
                <div className="text-default-600">is it getting hot in here or is it just me</div>

                <div className="flex items-center gap-1 text-[12px] mt-1 text-default-400">
                    <button className="pe-2">6 days ago</button>

                    <button className="px-2 ">Reply</button>

                    <button className="px-2 group-hover:block hidden">
                        <EllipsisIcon size={18} />
                    </button>
                </div>

                <div className="mt-1 flex">
                    <Button
                        className="px-0 bg-transparent text-default-400"
                        size="sm"
                        disableRipple
                        endContent={<ChevronDownIcon size={16} />}
                    >
                        See 20 replies
                    </Button>
                </div>
            </section>
            <section>
                <div className="flex items-center gap-3">
                    <Button
                        title="like"
                        // onClick={isLiked ? handleUnLike : handleLike}
                        size="sm"
                        radius="full"
                        color="default"
                        variant="light"
                        className="flex-col w-auto h-auto min-w-0 px-1.5 py-2"
                        startContent={<HeartIcon isFilled={false} size={18} />}
                    >
                        18
                    </Button>
                </div>
            </section>
        </div>
    );
}
