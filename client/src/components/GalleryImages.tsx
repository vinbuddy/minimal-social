import { IMediaFile } from "@/types/post";
import Image from "next/image";

interface IProps {
    images: IMediaFile[];
}

export default function GalleryImages({ images }: IProps) {
    console.log("images: ", images);
    return (
        <ul className="gallery w-full flex flex-wrap gap-2 list-none">
            {images.map((image, index) => (
                <li className={`flex-grow rounded-2xl overflow-hidden h-[40vh]`} key={index}>
                    {image.type === "video" ? (
                        <></>
                    ) : (
                        <img
                            className="object-cover min-w-full max-h-full align-bottom"
                            src={image?.url}
                            alt=""
                            // width={0}
                            // height={0}
                            // sizes="100vw"
                            // style={{
                            //     width: "100%",
                            //     height: "100%",
                            // }}
                        />
                    )}
                </li>
            ))}
            {/* <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05466_kwlv0n.jpg"
                    alt="A Toyota Previa covered in graffiti"
                    loading="lazy"
                />
            </li>
            <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05621_zgtcco.jpg"
                    alt="Interesting living room light through a window"
                    loading="lazy"
                />
            </li>
            <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05513_gfbiwi.jpg"
                    alt="Sara on a red bike"
                    loading="lazy"
                />
            </li>
            <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05588_nb0dma.jpg"
                    alt="XOXO venue in between talks"
                    loading="lazy"
                />
            </li>
            <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05459_ziuomy.jpg"
                    alt="Trees lit by green light during dusk"
                    loading="lazy"
                />
            </li>
            <li>
                <img
                    src="https://res.cloudinary.com/css-tricks/image/upload/f_auto,q_auto/v1568814785/photostream-photos/DSC05586_oj8jfo.jpg"
                    alt="Portrait of Justin Pervorse"
                    loading="lazy"
                />
            </li> */}
            {/* <li className="flex-grow-[10]"></li> */}
        </ul>
    );
}
