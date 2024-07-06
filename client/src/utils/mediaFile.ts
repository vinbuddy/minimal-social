export const getFileDimension = (file: File) => {
    return new Promise((resolve, reject) => {
        const type = getFileFormat(file.type);

        if (type === "image") {
            const img = new Image();
            const imgURL = URL.createObjectURL(file);
            img.onload = () => {
                const { naturalWidth: width, naturalHeight: height } = img;
                URL.revokeObjectURL(imgURL);

                resolve({ width, height });
            };

            img.onerror = () => {
                reject("There was some problem with the image.");
            };

            img.src = imgURL;
        } else {
            const video = document.createElement("video");
            const videoURL = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                const { videoWidth: width, videoHeight: height } = video;
                URL.revokeObjectURL(videoURL);
                resolve({ width, height });
            };

            video.onerror = () => {
                reject("There was some problem with the video.");
            };

            video.src = videoURL;
            video.load();
        }
    });
};

export const getFileFormat = (type: string) => {
    if (type === "image/jpeg" || type === "image/png") {
        return "image";
    } else {
        return "video";
    }
};

const calculateFileSize = (size: number): { size: number; unit: string } => {
    let _size = size;
    let fSExt = new Array("Bytes", "KB", "MB", "GB");
    let i = 0;

    while (_size > 900) {
        _size /= 1024;
        i++;
    }
    let exactSize: number = Math.round(_size * 100) / 100;

    //let exactSize = Math.round(_size * 100) / 100 + " " + fSExt[i];

    return {
        size: exactSize,
        unit: fSExt[i],
    };
};

export const checkLimitSize = (file: File): boolean => {
    const type: string = getFileFormat(file.type);
    const limit: number = type === "image" ? 50 : 100;

    const _size = calculateFileSize(file.size);

    if (_size.size > limit && _size.unit == "MB") {
        return false;
    }

    return true;
};
