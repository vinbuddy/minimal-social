"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Avatar,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Progress,
    useDisclosure,
} from "@heroui/react";
import { CheckIcon, Music2Icon, PlusIcon, VideoIcon } from "lucide-react";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "../confirmation-modal";
import RichTextEditor from "../rich-text-editor";
import { ReelsIcon } from "@/assets/icons";
import { useBreakpoint, useGlobalMutation } from "@/hooks";
import { useAuthStore } from "@/hooks/store";
import { IAudio, IReel, IReelUploadSignature } from "@/types/reel";
import axiosInstance from "@/utils/http-request";
import {
    formatDuration,
    getVideoFit,
    IVideoMetadata,
    readVideoMetadata,
    REEL_ACCEPTED_TYPES,
    uploadVideoToCloudinary,
} from "@/utils/reel";
import { showToast } from "@/utils/toast";

// Mirrors the server limits; the server checks them again after upload
const MAX_DURATION = 90;
const MAX_SIZE_MB = 100;

interface IProps {
    // Opened from an audio page: that audio is preselected
    presetAudio?: IAudio;
    children?: (open: () => void) => React.ReactNode;
}

interface ISelectedVideo {
    file: File;
    previewUrl: string;
    metadata: IVideoMetadata;
}

type UploadStage = "idle" | "uploading" | "processing";

export default function ReelUploadModalButton({ presetAudio, children }: IProps) {
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const mutate = useGlobalMutation();
    const { currentUser } = useAuthStore();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const discardModal = useDisclosure();
    const { t: tReel } = useTranslation("reel");

    const [video, setVideo] = useState<ISelectedVideo | null>(null);
    const [caption, setCaption] = useState<string>("");
    const [audioId, setAudioId] = useState<string | null>(presetAudio?._id ?? null);
    const [stage, setStage] = useState<UploadStage>("idle");
    const [progress, setProgress] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const captionRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const { data: savedAudiosResponse } = useSWR<{ data: IAudio[] }>(isOpen ? "/reel/audio/saved?limit=20" : null);
    const savedAudios = savedAudiosResponse?.data ?? [];
    const audioOptions = presetAudio && !savedAudios.some((audio) => audio._id === presetAudio._id)
        ? [presetAudio, ...savedAudios]
        : savedAudios;
    const selectedAudio = audioOptions.find((audio) => audio._id === audioId) ?? null;
    const isBusy = stage !== "idle";

    useEffect(() => {
        return () => {
            if (video) URL.revokeObjectURL(video.previewUrl);
        };
    }, [video]);

    // Whatever the page was playing (the audio page's player, the reel in view) would sound over the preview
    useEffect(() => {
        if (!isOpen) return;

        document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((media) => {
            if (media !== videoRef.current && media !== audioRef.current) media.pause();
        });
    }, [isOpen]);

    // Preview the chosen sound in place of the video's own track
    useEffect(() => {
        const element = videoRef.current;
        const audio = audioRef.current;
        if (!element) return;

        element.muted = selectedAudio !== null;
        if (audio) {
            audio.currentTime = element.currentTime;
            if (!element.paused) audio.play().catch(() => {});
        }
    }, [selectedAudio, video]);

    const reset = () => {
        setVideo(null);
        setCaption("");
        setAudioId(presetAudio?._id ?? null);
        setStage("idle");
        setProgress(0);
        abortRef.current = null;
    };

    const handleSelectFile = async (file?: File) => {
        if (!file) return;

        if (!REEL_ACCEPTED_TYPES.split(",").includes(file.type)) {
            return showToast(tReel("REEL_UPLOAD.UNSUPPORTED"), "error");
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return showToast(tReel("REEL_UPLOAD.TOO_LARGE", { size: MAX_SIZE_MB }), "error");
        }

        try {
            const metadata = await readVideoMetadata(file);
            if (metadata.duration > MAX_DURATION + 0.5) {
                return showToast(tReel("REEL_UPLOAD.TOO_LONG", { duration: MAX_DURATION }), "error");
            }

            setVideo({ file, metadata, previewUrl: URL.createObjectURL(file) });
        } catch {
            showToast(tReel("REEL_UPLOAD.UNSUPPORTED"), "error");
        }
    };

    const handleShare = async () => {
        if (!video) return;

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setStage("uploading");
            const signatureResponse = await axiosInstance.post("/reel/upload-signature");
            const signature = signatureResponse.data.data as IReelUploadSignature;

            const publicId = await uploadVideoToCloudinary(video.file, signature, setProgress, controller.signal);

            setStage("processing");
            const response = await axiosInstance.post("/reel", {
                publicId,
                caption,
                audioId: audioId ?? undefined,
            });
            const reel = response.data.data as IReel;

            // Profile and audio grids; the feed is left alone so it does not re-rank under the viewer
            mutate((key) => typeof key === "string" && (key.includes("/reel/user") || key.includes("/reel/audio")));
            showToast(tReel("REEL_UPLOAD.SUCCESS"), "success");

            reset();
            onClose();
            router.push(`/reels/${reel._id}`);
        } catch (error: any) {
            if (controller.signal.aborted) return;

            setStage("idle");
            setProgress(0);
            showToast(error?.response?.data?.message ?? tReel("REEL_UPLOAD.FAILED"), "error");
        }
    };

    // Closing with a picked video asks first; an upload in progress is cancelled
    const handleOpenChange = (open: boolean) => {
        if (!open && video) {
            discardModal.onOpen();
            return;
        }
        onOpenChange();
    };

    const handleDiscard = async () => {
        abortRef.current?.abort();
        reset();
        onClose();
    };

    const renderDropzone = () => (
        <div
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleSelectFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center gap-4 min-h-[420px] rounded-large border-2 border-dashed transition-colors ${
                isDragging ? "border-foreground bg-content2" : "border-divider"
            }`}
        >
            <ReelsIcon size={64} />
            <div className="text-center">
                <p className="text-xl">{tReel("REEL_UPLOAD.DROP_HINT")}</p>
                <p className="text-small text-default-500 mt-1">
                    {tReel("REEL_UPLOAD.REQUIREMENTS", { duration: MAX_DURATION, size: MAX_SIZE_MB })}
                </p>
            </div>
            <Button color="primary" onPress={() => fileInputRef.current?.click()}>
                {tReel("REEL_UPLOAD.SELECT_VIDEO")}
            </Button>
        </div>
    );

    const renderAudioOption = (key: string, isSelected: boolean, onSelect: () => void, content: React.ReactNode) => (
        <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isBusy}
            onClick={onSelect}
            className={`flex items-center gap-3 w-full p-2 rounded-medium text-start outline-none transition-colors hover:bg-content2 focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${
                isSelected ? "bg-content2" : ""
            }`}
        >
            {content}
            <span className="ms-auto shrink-0">{isSelected && <CheckIcon size={18} />}</span>
        </button>
    );

    const renderEditor = () => {
        if (!video) return null;

        return (
            <div className="flex flex-col md:flex-row gap-6">
                {/* Preview */}
                <div className="relative mx-auto h-[min(calc(100dvh-300px),560px)] min-h-[320px] aspect-[9/16] shrink-0 rounded-large overflow-hidden bg-black">
                    <video
                        ref={videoRef}
                        src={video.previewUrl}
                        autoPlay
                        loop
                        playsInline
                        muted={selectedAudio !== null}
                        onPlay={() => audioRef.current?.play().catch(() => {})}
                        onPause={() => audioRef.current?.pause()}
                        onSeeked={(event) => {
                            if (audioRef.current) audioRef.current.currentTime = event.currentTarget.currentTime;
                        }}
                        onTimeUpdate={(event) => {
                            // The loop restarted: restart the sound with it
                            const audio = audioRef.current;
                            if (audio && event.currentTarget.currentTime < 0.3 && audio.currentTime > 1) {
                                audio.currentTime = 0;
                            }
                        }}
                        className={`w-full h-full ${
                            getVideoFit(video.metadata.width, video.metadata.height) === "cover"
                                ? "object-cover"
                                : "object-contain"
                        }`}
                    />
                    {selectedAudio && <audio ref={audioRef} src={selectedAudio.url} preload="auto" />}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-tiny tabular-nums">
                        {formatDuration(video.metadata.duration)}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                        <Avatar size="sm" src={currentUser?.photo} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-1">{currentUser?.username}</p>
                            {/* Uncontrolled: `value` is only the initial content, feeding state back resets the caret */}
                            <RichTextEditor
                                ref={captionRef}
                                isMention
                                isTag
                                placeholder={tReel("REEL_UPLOAD.CAPTION_PLACEHOLDER")}
                                handleInputChange={setCaption}
                                className="w-full min-h-[72px]"
                            />
                        </div>
                    </div>

                    <section className="border-t border-divider pt-4">
                        <h4 className="text-sm font-semibold mb-2">{tReel("REEL_UPLOAD.AUDIO")}</h4>
                        <div role="radiogroup" aria-label={tReel("REEL_UPLOAD.AUDIO")} className="flex flex-col gap-1 max-h-[240px] overflow-y-auto scrollbar">
                            {renderAudioOption(
                                "original",
                                audioId === null,
                                () => setAudioId(null),
                                <>
                                    <span className="flex items-center justify-center size-10 rounded-small bg-content2 shrink-0">
                                        <VideoIcon size={18} />
                                    </span>
                                    <span className="text-sm">{tReel("REEL_UPLOAD.USE_ORIGINAL_AUDIO")}</span>
                                </>
                            )}

                            {audioOptions.map((audio) =>
                                renderAudioOption(
                                    audio._id,
                                    audioId === audio._id,
                                    () => setAudioId(audio._id),
                                    <>
                                        <img
                                            src={audio.coverUrl}
                                            alt=""
                                            className="size-10 rounded-small object-cover shrink-0"
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-sm truncate">
                                                {audio.title ?? tReel("AUDIO.ORIGINAL")}
                                            </span>
                                            <span className="block text-tiny text-default-500 truncate">
                                                {audio.owner?.username} · {formatDuration(audio.duration)}
                                            </span>
                                        </span>
                                    </>
                                )
                            )}
                        </div>

                        {audioOptions.length === 0 && (
                            <p className="text-tiny text-default-500 mt-2">{tReel("REEL_UPLOAD.NO_SAVED_AUDIOS")}</p>
                        )}
                        {selectedAudio && (
                            <p className="flex items-center gap-1.5 text-tiny text-default-500 mt-2">
                                <Music2Icon size={12} />
                                {tReel("REEL_UPLOAD.AUDIO_REPLACES")}
                            </p>
                        )}
                    </section>

                    {isBusy && (
                        <Progress
                            aria-label={tReel("REEL_UPLOAD.UPLOADING", { percent: progress })}
                            size="sm"
                            color="primary"
                            isIndeterminate={stage === "processing"}
                            value={progress}
                            label={
                                stage === "uploading"
                                    ? tReel("REEL_UPLOAD.UPLOADING", { percent: progress })
                                    : tReel("REEL_UPLOAD.PROCESSING")
                            }
                            classNames={{ label: "text-tiny text-default-500" }}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {children ? (
                children(onOpen)
            ) : (
                <Button
                    isIconOnly
                    radius="full"
                    variant="flat"
                    aria-label={tReel("REEL_CREATE")}
                    title={tReel("REEL_CREATE")}
                    onPress={onOpen}
                    className="bg-content2"
                >
                    <PlusIcon size={20} />
                </Button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={REEL_ACCEPTED_TYPES}
                hidden
                onChange={(event) => {
                    handleSelectFile(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />

            <Modal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                size={breakpoint === "mobile" ? "full" : video ? "3xl" : "xl"}
                scrollBehavior="inside"
                isDismissable={!isBusy}
                hideCloseButton={isBusy}
            >
                <ModalContent>
                    <ModalHeader className="justify-center border-b border-divider text-base">
                        {tReel("REEL_UPLOAD.TITLE")}
                    </ModalHeader>
                    <ModalBody className="py-5">{video ? renderEditor() : renderDropzone()}</ModalBody>
                    {video && (
                        <ModalFooter className="border-t border-divider">
                            <Button
                                variant="light"
                                isDisabled={isBusy}
                                onPress={() => fileInputRef.current?.click()}
                            >
                                {tReel("REEL_UPLOAD.CHANGE_VIDEO")}
                            </Button>
                            <Button color="primary" isLoading={isBusy} onPress={handleShare}>
                                {tReel("REEL_UPLOAD.SHARE")}
                            </Button>
                        </ModalFooter>
                    )}
                </ModalContent>
            </Modal>

            <ConfirmationModal
                isOpen={discardModal.isOpen}
                onOpenChange={discardModal.onOpenChange}
                onClose={discardModal.onClose}
                onOk={handleDiscard}
                title={tReel("REEL_UPLOAD.DISCARD_TITLE")}
                description=""
                okButtonContent={tReel("REEL_UPLOAD.DISCARD")}
            />
        </>
    );
}
