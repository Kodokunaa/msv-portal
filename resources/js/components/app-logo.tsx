export default function AppLogo() {
    return (
        <>
            <div className="flex size-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                <img src="/images/msv-logo.png" alt="MSV" className="size-9 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-bold text-white">Mindoro Supporting</span>
                <span className="truncate text-[10px] font-semibold tracking-[0.16em] text-[#f0d642]">VARSITARIAN, INC.</span>
            </div>
        </>
    );
}
