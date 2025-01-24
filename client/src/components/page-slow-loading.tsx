import Image from "next/image";

export default function PageSlowLoading() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-5">
            <Image
                className="rounded grayscale md:w-[500px] w-[240px]"
                width={350}
                height={350}
                src="/images/slow-loading.gif"
                alt="background"
                priority
            />
            <h1 className="text-2xl text-black mt-5 font-semibold text-center">
                Thanks for your patience! Our server is taking its time because <br />
                well... free things are not always the fastest. 🚀✨
            </h1>
        </div>
    );
}
