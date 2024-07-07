// "use client";
// import {
//     useEffect,
//     useRef,
//     useState,
//     forwardRef,
//     useImperativeHandle,
// } from "react";
// import { Slider } from "antd";

// import { SlVolume2, SlVolumeOff } from "react-icons/sl";
// import { FaPlay } from "react-icons/fa";

// import useVideo from "@/hooks/useVideo";

// interface IProps {
//     src: string;
//     className?: string;
//     timeline?: boolean;
//     loop?: boolean;
//     autoPlay?: boolean;
//     playOrPause?: boolean;
//     inViewOptions?: IntersectionObserverInit;
// }

// function VideoPlayer(
//     {
//         src,
//         loop = true,
//         autoPlay = true,
//         timeline = true,
//         playOrPause = true,
//         className = "w-full h-auto rounded-xl",
//         inViewOptions = { root: null, rootMargin: "0px", threshold: 0.5 },
//         ...props
//     }: IProps,
//     ref: React.ForwardedRef<HTMLVideoElement>
// ) {
//     const { setVideoTime, getVideo } = useVideo();

//     const [playing, setPlaying] = useState<boolean>(true);
//     const [muted, setMuted] = useState<boolean>(() => {
//         return getVideo(src)?.muted ?? true;
//     });

//     const [currentTime, setCurrentTime] = useState<[number, number]>(() => {
//         return getVideo(src)?.time.currentTime || [0, 0];
//     });
//     const [duration, setDuration] = useState<[number, number]>(() => {
//         return getVideo(src)?.time.duration || [0, 0];
//     });
//     const [durationSec, setDurationSec] = useState<number>(() => {
//         return getVideo(src)?.time.durationSec || 0;
//     });
//     const [currentTimeSec, setCurrentTimeSec] = useState<number>(() => {
//         return getVideo(src)?.time.currentTimeSec || 0;
//     });

//     const videoRef = useRef<HTMLVideoElement | null>(null);

//     const sec2Min = (sec: number): { min: number; sec: number } => {
//         const min = Math.floor(sec / 60);
//         const secRemain = Math.floor(sec % 60);

//         return {
//             min: min || 0,
//             sec: secRemain || 0,
//         };
//     };

//     useEffect(() => {
//         const videoKept = getVideo(src);

//         if (videoRef.current && !videoKept) {
//             const { min, sec } = sec2Min(videoRef.current.duration);

//             setDurationSec(videoRef.current.duration);
//             setDuration([min, sec]);
//         }

//         if (videoRef.current && videoKept) {
//             const { min, sec } = sec2Min(videoKept.time.durationSec);

//             setDurationSec(videoKept.time.durationSec);
//             setDuration([min, sec]);
//         }
//     }, [currentTimeSec, durationSec]);

//     useEffect(() => {
//         const videoElement = videoRef.current;

//         if (!videoElement) return;

//         const handlePlay = (): void => setPlaying(true);

//         const handlePause = (): void => setPlaying(false);

//         videoElement.addEventListener("play", handlePlay);
//         videoElement.addEventListener("pause", handlePause);

//         return () => {
//             videoElement.removeEventListener("play", handlePlay);
//             videoElement.removeEventListener("pause", handlePause);
//         };
//     }, []);

//     useEffect(() => {
//         const videoKept = getVideo(src);

//         // Pass previous time to videoRef
//         if (videoKept && videoRef.current) {
//             videoRef.current.currentTime = videoKept.time.currentTimeSec;
//         }
//     }, []);

//     // Handle play - pause video in - out viewport
//     useEffect(() => {
//         const handleVideoInViewport: IntersectionObserverCallback = (
//             entries
//         ) => {
//             entries.forEach((entry) => {
//                 if (videoRef.current) {
//                     if (entry.isIntersecting) {
//                         videoRef.current?.play();
//                     } else {
//                         videoRef.current?.pause();
//                         videoRef.current.autoplay = false;
//                     }
//                 }
//             });
//         };
//         const observer = new IntersectionObserver(
//             handleVideoInViewport,
//             inViewOptions
//         );

//         if (videoRef.current) {
//             observer.observe(videoRef.current);
//         }

//         return () => {
//             if (videoRef.current) {
//                 observer.unobserve(videoRef.current);
//             }
//         };
//     }, []);

//     useEffect(() => {
//         const isFullscreen = getVideo(src)?.isFullscreen;
//         const prevMuted = getVideo(src)?.muted;

//         if (!videoRef.current) {
//             return;
//         }

//         if (!isFullscreen && prevMuted != undefined) {
//             videoRef.current.muted = prevMuted;
//             setMuted(prevMuted);
//         }
//     }, [getVideo(src)?.isFullscreen ?? false]);

//     const handlePlay = (): void => {
//         if (playing) {
//             videoRef.current?.pause();
//             setPlaying(false);
//         } else {
//             videoRef.current?.play();
//             setPlaying(true);
//         }
//     };

//     const handleToggleMute = (
//         e?: React.MouseEvent<HTMLButtonElement>
//     ): void => {
//         if (e) {
//             e.stopPropagation();
//         }

//         if (videoRef.current) {
//             videoRef.current.muted = !muted;
//             setMuted(!muted);
//         }
//     };

//     const handleTimeUpdate = (): void => {
//         if (videoRef.current) {
//             const { min, sec } = sec2Min(videoRef.current.currentTime);
//             setCurrentTimeSec(videoRef.current?.currentTime);
//             setCurrentTime([min, sec]);
//         }
//     };

//     const handleSeek = (value: number): void => {
//         if (videoRef.current) {
//             videoRef.current.currentTime = value;

//             handleTimeUpdate();
//         }
//     };

//     const handleKeepCurrentTime = (): void => {
//         setVideoTime(src, muted, {
//             currentTime,
//             currentTimeSec,
//             duration,
//             durationSec,
//         });

//         if (videoRef.current && !muted && !playOrPause && !timeline) {
//             videoRef.current.muted = true;
//             setMuted(true);
//         }
//     };

//     useImperativeHandle(ref, () => videoRef.current!, []);

//     return (
//         <div
//             onClick={handleKeepCurrentTime}
//             className={`${className} relative overflow-hidden`}
//         >
//             <video
//                 onTimeUpdate={handleTimeUpdate}
//                 ref={videoRef}
//                 autoPlay={autoPlay}
//                 loop={loop}
//                 className="w-full h-full block"
//                 src={src}
//                 muted={muted}
//                 controls={false}
//                 {...props}
//             >
//                 <source src={src} type="video/mp4" />
//             </video>
//             {/* Controls Overlay */}
//             <div className="absolute top-0 left-0 w-full h-full bg-transparent">
//                 {/* Pause - Play button */}
//                 {playOrPause && (
//                     <div
//                         onClick={handlePlay}
//                         className="absolute flex items-center justify-center cursor-pointer top-0 left-0 right-0 bottom-20"
//                     >
//                         <button
//                             className={`rounded-full p-5 bg-[rgba(0,0,0,0.5)] scale-0 invisible transition-all ${
//                                 !playing ? "!scale-100 !visible" : ""
//                             }`}
//                         >
//                             <FaPlay className="text-white text-xl" />
//                         </button>
//                     </div>
//                 )}

//                 {/* Muted Toggle button */}
//                 <div
//                     className={`absolute right-3 ${
//                         !timeline ? "bottom-3" : "bottom-10"
//                     }`}
//                 >
//                     <button
//                         onClick={handleToggleMute}
//                         className=" rounded-full p-3 bg-[rgba(0,0,0,0.5)]"
//                     >
//                         {muted ? (
//                             <SlVolumeOff className="text-white" />
//                         ) : (
//                             <SlVolume2 className="text-white" />
//                         )}
//                     </button>
//                 </div>

//                 {/* Range timeline */}
//                 {timeline && (
//                     <div className="flex items-center absolute bottom-0 left-0 w-full px-3">
//                         <div className="flex-1">
//                             <Slider
//                                 tooltip={{
//                                     formatter: (value?: number) =>
//                                         `${currentTime[0]}:${currentTime[1]}`,
//                                 }}
//                                 classNames={{
//                                     handle: "after:!shadow-none",
//                                     track: "!transition-[width] !ease-linear",
//                                 }}
//                                 styles={{
//                                     rail: {
//                                         background: "rgba(243, 245, 247, 0.2)",
//                                     },
//                                     track: {
//                                         background: "#fff",
//                                     },
//                                 }}
//                                 value={currentTimeSec}
//                                 max={durationSec}
//                                 min={0}
//                                 onChange={handleSeek}
//                             />
//                         </div>
//                         <div className="text-white text-sm  rounded-full ps-2">
//                             {currentTime[0]}:{currentTime[1]} / {duration[0]}:
//                             {duration[1]}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default forwardRef(VideoPlayer);
