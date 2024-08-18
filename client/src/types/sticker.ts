export interface IStickerItem {
    publicId: string;
    tags: string[];
    url: string;
}

export interface ISticker {
    _id: string;
    name: string;
    stickers?: IStickerItem[];
    thumbnail: string;
}
