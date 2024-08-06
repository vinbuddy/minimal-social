import { IMediaFile } from "@/types/post";
import Image from "next/image";

interface IProps {
    images: IMediaFile[];
}

export default function GalleryImages({ images }: IProps) {
    return (
        <ul className="gallery w-full flex flex-wrap gap-2 list-none">
            {images.map((image, index) => (
                <li className={`flex-grow rounded-2xl overflow-hidden h-[40vh]`} key={index}>
                    {image.type === "video" ? (
                        <></>
                    ) : (
                        <Image
                            className="object-cover min-w-full max-h-full align-bottom"
                            src={image?.url}
                            alt=""
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}
