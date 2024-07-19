export const HomeIcon = ({ className = "", size = 24, isFilled = false }) => {
    return (
        <>
            {isFilled ? (
                <svg
                    aria-label="Trang chủ"
                    role="img"
                    viewBox="0 0 26 26"
                    style={{
                        height: size,
                        width: size,
                        fill: isFilled ? "currentColor" : "none",
                        stroke: "currentColor",
                    }}
                >
                    <title>Trang chủ</title>
                    <path
                        d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H8.25C8.52614 22.7497 8.75 22.5259 8.75 22.2497V17.6822V17.4997C8.75 15.1525 10.6528 13.2497 13 13.2497C15.3472 13.2497 17.25 15.1525 17.25 17.4997V17.6822V22.2497C17.25 22.5259 17.4739 22.7497 17.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94815 21.8954 8.99883L16.1454 4.3454C14.3112 2.86095 11.6888 2.86095 9.85455 4.3454L4.10455 8.99883C2.93153 9.94815 2.25 11.3765 2.25 12.8855Z"
                        fill="currentColor"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="2.5"
                    ></path>
                </svg>
            ) : (
                <svg
                    style={{
                        height: size,
                        width: size,
                    }}
                    aria-label="Trang chủ"
                    role="img"
                    viewBox="0 0 26 26"
                >
                    <title>Trang chủ</title>
                    <path
                        d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H9.25C9.52614 22.7497 9.75 22.5258 9.75 22.2497V17.6822V16.4997C9.75 14.7048 11.2051 13.2497 13 13.2497C14.7949 13.2497 16.25 14.7048 16.25 16.4997V17.6822V22.2497C16.25 22.5258 16.4739 22.7497 16.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94814 21.8954 8.99882L16.1454 4.34539C14.3112 2.86094 11.6888 2.86094 9.85455 4.34539L4.10455 8.99882C2.93153 9.94814 2.25 11.3765 2.25 12.8855Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="2.5"
                    ></path>
                </svg>
            )}
        </>
    );
};

export const BirthdayHatIcon = ({ className = "", width = 24, height = 24 }) => {
    return (
        <svg
            aria-label="Biểu tượng mũ sinh nhật"
            role="img"
            viewBox="0 0 20 20"
            style={{ height: height, width: width, fill: "currentColor" }}
        >
            <path
                d="M8.30265 18.7451C7.77676 18.5536 7.31797 18.2284 6.96562 17.7996C5.82792 17.7868 4.71756 17.086 4.20809 16.05C3.14169 15.8194 2.24264 15.0301 1.89131 13.9813C1.58563 13.0706 1.7139 12.0813 2.24214 11.2647C2.4846 10.8885 2.81708 10.5658 3.20813 10.326C3.41995 9.80996 3.77229 9.36903 4.25683 9.01297C4.88978 8.54786 5.64819 8.32666 6.39143 8.39094C6.58371 8.40736 6.77052 8.44098 6.95143 8.49084L10.8423 4.27115C10.6816 3.66743 10.7038 3.01999 10.9255 2.4108C11.5144 0.792878 13.3093 -0.0447146 14.9272 0.54416C16.5452 1.13303 17.3825 2.9287 16.7936 4.54662C16.5719 5.15581 16.172 5.66579 15.6605 6.02563L15.9298 11.7587C16.0997 11.8365 16.2637 11.9306 16.4211 12.0406C17.0336 12.4706 17.4724 13.1276 17.6583 13.8907C17.8006 14.4749 17.7868 15.0399 17.6176 15.5707C17.7626 16.0048 17.8102 16.4649 17.7543 16.9106C17.634 17.8757 17.0964 18.7161 16.2768 19.2172C15.3335 19.7948 14.1382 19.8218 13.1723 19.3128C12.1156 19.7803 10.8207 19.604 9.93605 18.8807C9.38979 18.9825 8.82925 18.9367 8.30265 18.7451Z"
                fill="#101010"
            ></path>
            <path
                d="M15.3477 4.02042C15.0485 4.84245 14.1396 5.2663 13.3175 4.9671C12.4955 4.66791 12.0716 3.75897 12.3708 2.93693C12.67 2.11489 13.579 1.69105 14.401 1.99024C15.223 2.28944 15.6469 3.19838 15.3477 4.02042Z"
                fill="#F3F5F7"
            ></path>
            <path
                d="M14.1122 5.85382L14.2319 8.40403C12.0525 9.48256 10.0253 9.92242 8.17757 9.69257C8.13666 9.68746 8.09895 9.67967 8.06123 9.67188C8.0315 9.66574 8.00176 9.65959 7.97045 9.65476L10.0759 7.37216C11.1437 7.21957 12.4846 6.78694 14.1122 5.85382Z"
                fill="#F3F5F7"
            ></path>
            <path
                clip-rule="evenodd"
                d="M16.1317 15.9853C16.2222 16.2172 16.259 16.4694 16.2276 16.7212C16.0952 17.7847 15.0384 18.3867 14.0953 18.0434C13.9818 18.0021 13.8763 17.949 13.7795 17.886C13.4371 17.6632 13.0001 17.6757 12.6374 17.8636C12.2563 18.0609 11.7975 18.1045 11.3622 17.946C11.1544 17.8704 10.9732 17.7555 10.8226 17.613C10.5387 17.3443 10.1352 17.2483 9.75658 17.3451C9.46007 17.421 9.13922 17.412 8.8292 17.2992C8.51922 17.1864 8.26771 16.987 8.08933 16.7383C7.86149 16.4207 7.49066 16.2348 7.10042 16.2582C6.89346 16.2706 6.68084 16.2421 6.47295 16.1665C6.03755 16.008 5.71403 15.6795 5.54899 15.2832C5.39203 14.9063 5.06508 14.6163 4.65982 14.5667C4.54515 14.5527 4.43025 14.5257 4.31673 14.4843C3.37356 14.1411 2.95105 13.0007 3.53311 12.1009C3.67098 11.8877 3.86131 11.7182 4.07968 11.5987C4.33282 11.4601 4.5124 11.2313 4.61176 10.9604C4.70315 10.7111 4.87303 10.469 5.16777 10.2526C5.48177 10.022 5.87163 9.88997 6.25969 9.92374C6.68424 9.96064 7.0168 10.1553 7.26511 10.4194L6.22691 11.5451C8.12854 12.0612 11.1655 12.2876 14.3314 10.5238L14.4492 13.0344C14.8093 12.9916 15.1893 13.0562 15.5382 13.3008C15.8572 13.5243 16.071 13.876 16.1634 14.2545C16.2501 14.6097 16.2246 14.9045 16.1344 15.1543C16.0363 15.4257 16.0269 15.7164 16.1317 15.9853ZM12.7686 15.1061C13.107 15.3261 13.547 15.3201 13.9043 15.1323C14.0994 15.0296 14.3172 14.9809 14.5399 14.966L14.4499 13.049C12.6739 13.8571 10.9394 14.1774 9.36525 14.2132C9.54928 14.2107 9.73633 14.2351 9.92008 14.302C10.1279 14.3776 10.3091 14.4925 10.4597 14.635C10.7436 14.9037 11.1471 14.9998 11.5258 14.9029C11.8223 14.8271 12.1431 14.836 12.4531 14.9488C12.5665 14.9901 12.6718 15.0431 12.7686 15.1061Z"
                fill="#F3F5F7"
                fill-rule="evenodd"
            ></path>
        </svg>
    );
};

export const HeartIcon = ({ className = "", size = 24, isFilled = false }) => {
    return (
        <svg
            aria-label="Thích"
            role="img"
            viewBox="0 0 18 18"
            className={className}
            style={{ height: size, width: size, fill: isFilled ? "currentColor" : "none", stroke: "currentColor" }}
        >
            <path
                d="M1.34375 7.53125L1.34375 7.54043C1.34374 8.04211 1.34372 8.76295 1.6611 9.65585C1.9795 10.5516 2.60026 11.5779 3.77681 12.7544C5.59273 14.5704 7.58105 16.0215 8.33387 16.5497C8.73525 16.8313 9.26573 16.8313 9.66705 16.5496C10.4197 16.0213 12.4074 14.5703 14.2232 12.7544C15.3997 11.5779 16.0205 10.5516 16.3389 9.65585C16.6563 8.76296 16.6563 8.04211 16.6562 7.54043V7.53125C16.6562 5.23466 15.0849 3.25 12.6562 3.25C11.5214 3.25 10.6433 3.78244 9.99228 4.45476C9.59009 4.87012 9.26356 5.3491 9 5.81533C8.73645 5.3491 8.40991 4.87012 8.00772 4.45476C7.35672 3.78244 6.47861 3.25 5.34375 3.25C2.9151 3.25 1.34375 5.23466 1.34375 7.53125Z"
                stroke-width="1.25"
            ></path>
        </svg>
    );
};
export const ConversationIcon = ({ className = "", size = 24, isFilled = false }) => {
    return (
        <>
            {isFilled ? (
                <svg
                    style={{
                        height: size,
                        width: size,
                        fill: isFilled ? "currentColor" : "none",
                        stroke: "currentColor",
                    }}
                    aria-label="Direct"
                    fill="currentColor"
                    height="24"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                >
                    <title>Direct</title>
                    <path
                        d="M22.91 2.388a.69.69 0 0 0-.597-.347l-20.625.002a.687.687 0 0 0-.482 1.178L7.26 9.16a.686.686 0 0 0 .778.128l7.612-3.657a.723.723 0 0 1 .937.248.688.688 0 0 1-.225.932l-7.144 4.52a.69.69 0 0 0-.3.743l2.102 8.692a.687.687 0 0 0 .566.518.655.655 0 0 0 .103.008.686.686 0 0 0 .59-.337L22.903 3.08a.688.688 0 0 0 .007-.692"
                        fill-rule="evenodd"
                    ></path>
                </svg>
            ) : (
                <svg
                    style={{ height: size, width: size }}
                    aria-label="Direct"
                    fill="currentColor"
                    role="img"
                    viewBox="0 0 24 24"
                >
                    <title>Direct</title>
                    <line
                        fill="none"
                        stroke="currentColor"
                        stroke-linejoin="round"
                        stroke-width="2"
                        x1="22"
                        x2="9.218"
                        y1="3"
                        y2="10.083"
                    ></line>
                    <polygon
                        fill="none"
                        points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                        stroke="currentColor"
                        stroke-linejoin="round"
                        stroke-width="2"
                    ></polygon>
                </svg>
            )}
        </>
    );
};

export const RepostIcon = ({ className = "", size = 24 }) => {
    return (
        <svg
            aria-label="Repost"
            role="img"
            viewBox="0 0 18 18"
            className={className}
            style={{ height: size, width: size, fill: "currentcolor" }}
        >
            <path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path>
            <path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path>
        </svg>
    );
};

export const CommentIcon = ({ className = "", size = 24, isFilled = false }) => {
    return (
        <svg
            aria-label="Trả lời"
            role="img"
            viewBox="0 0 18 18"
            className={className}
            style={{ height: size, width: size, fill: isFilled ? "currentColor" : "none", stroke: "currentColor" }}
        >
            <path
                d="M15.376 13.2177L16.2861 16.7955L12.7106 15.8848C12.6781 15.8848 12.6131 15.8848 12.5806 15.8848C11.3779 16.5678 9.94767 16.8931 8.41995 16.7955C4.94194 16.5353 2.08152 13.7381 1.72397 10.2578C1.2689 5.63919 5.13697 1.76863 9.75264 2.22399C13.2307 2.58177 16.0261 5.41151 16.2861 8.92429C16.4161 10.453 16.0586 11.8841 15.376 13.0876C15.376 13.1526 15.376 13.1852 15.376 13.2177Z"
                stroke-linejoin="round"
                stroke-width="1.25"
            ></path>
        </svg>
    );
};
export const SearchIcon = ({ className = "", size = 24, isFilled = false }) => {
    return (
        <svg
            aria-label="Tìm kiếm"
            role="img"
            viewBox="0 0 24 24"
            style={{ height: size, width: size, fill: "currentcolor" }}
        >
            <title>Tìm kiếm</title>
            <path
                d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
            ></path>
            <line
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                x1="16.511"
                x2="22"
                y1="16.511"
                y2="22"
            ></line>
        </svg>
    );
};

export const VerifiedIcon = ({ className = "", size = 24 }) => {
    return (
        <svg
            aria-label="Đã xác minh"
            role="img"
            viewBox="0 0 40 40"
            className={className}
            style={{ height: size, width: size, fill: "currentColor" }}
        >
            <title>Đã xác minh</title>
            <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"></path>
        </svg>
    );
};
