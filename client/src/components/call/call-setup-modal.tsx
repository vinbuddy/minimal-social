"use client";
import {
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Switch,
    useDisclosure,
} from "@heroui/react";
import {
    Call,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    useCall,
    useStreamVideoClient,
    VideoPreview,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import cn from "classnames";

import { useGetCallById } from "@/hooks";
import { generateRandomId } from "@/utils";
import { CameraIcon, MicIcon } from "lucide-react";

interface IProps {
    children: React.ReactNode;
}

export default function CallSetupModal({ children }: IProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [call, setCall] = useState<Call>();
    const [callId, setCallId] = useState<string>("");
    const [isCallLoading, setIsCallLoading] = useState(true);

    const [isCameraDisabled, setIsCameraDisabled] = useState(false);
    const [isMicDisabled, setIsMicDisabled] = useState(false);

    const client = useStreamVideoClient();

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName });
                setIsCameraDisabled(cameraPermission.state == "denied");

                const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName });
                setIsMicDisabled(micPermission.state == "denied");

                // cameraPermission.onchange = () => setIsCameraDisabled(cameraPermission.state === "denied");
                // micPermission.onchange = () => setIsMicDisabled(micPermission.state === "denied");
            } catch (error) {
                console.error("Lỗi khi kiểm tra quyền:", error);
            }
        };

        checkPermissions();
    }, []);

    useEffect(() => {
        if (!isOpen && call) {
            call.camera.disable();
        }
    }, [isOpen, call]);

    // Create call
    useEffect(() => {
        if (!isOpen || !client) return;

        const id = generateRandomId();
        setCallId(id);

        const getCall = async () => {
            try {
                const { calls } = await client.queryCalls({ filter_conditions: { id } });
                if (calls.length > 0) {
                    setCall(calls[0]);
                } else {
                    // Create new call if not found
                    const newCall = client.call("default", id);
                    await newCall.create();
                    setCall(newCall);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCallLoading(false);
            }
        };

        getCall();
    }, [client, isOpen]);

    useEffect(() => {
        if (!call) return;

        if (isCameraDisabled) {
            call.camera.disable();
        } else call.camera.enable();
    }, [isCameraDisabled, call?.camera]);

    useEffect(() => {
        if (!call) return;

        if (isMicDisabled) {
            call.microphone.disable();
        } else {
            call.microphone.enable();
        }
    }, [isMicDisabled, call?.microphone]);

    return (
        <>
            <div className="size-full flex items-center justify-center" onClick={onOpen}>
                {children}
            </div>
            <Modal
                isDismissable={false}
                backdrop="blur"
                size="4xl"
                scrollBehavior="inside"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center justify-between">Call setup</ModalHeader>
                            <ModalBody id="call-setup" className="py-0 px-6 scrollbar">
                                {call && (
                                    <StreamCall call={call}>
                                        <StreamTheme className="h-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                                                <section>
                                                    <div className="h-full overflow-hidden rounded-2xl bg-content2">
                                                        <VideoPreview
                                                            className={cn(
                                                                "w-full h-full text-default-500",
                                                                "[&>div]:flex",
                                                                "[&>div]:h-full",
                                                                "[&>div]:items-center",
                                                                "[&>div]:justify-center",
                                                                "[&>video]:h-full"
                                                            )}
                                                        />
                                                    </div>
                                                </section>

                                                <section className="flex flex-col justify-between">
                                                    <h3 className="mb-5">
                                                        Call id: <Chip>{call?.id}</Chip>
                                                    </h3>
                                                    {/* CAM CONTROL */}
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <CameraIcon className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Camera</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {isCameraDisabled ? "Off" : "On"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                color="success"
                                                                isSelected={!isCameraDisabled}
                                                                onValueChange={(checked) =>
                                                                    setIsCameraDisabled(!checked)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between mt-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <MicIcon className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Microphone</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {isMicDisabled ? "Off" : "On"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                isSelected={!isMicDisabled}
                                                                color="success"
                                                                onValueChange={(checked) => setIsMicDisabled(!checked)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-5 mt-5">
                                                        <Button
                                                            fullWidth
                                                            color="default"
                                                            variant="light"
                                                            onPress={onClose}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button fullWidth color="primary">
                                                            Call
                                                        </Button>
                                                    </div>
                                                </section>
                                            </div>
                                        </StreamTheme>
                                    </StreamCall>
                                )}
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
