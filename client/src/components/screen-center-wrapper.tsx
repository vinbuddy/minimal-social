interface IProps {
    children: React.ReactNode;
}

export default function ScreenCenterWrapper({ children }: IProps) {
    return <div className="flex items-center justify-center w-full h-screen">{children}</div>;
}
