export function scrollToBottom(tag: string) {
    const domWrapper = document.querySelector(tag)!; // 外层容器 出现滚动条的dom
    (function smoothscroll() {
        const currentScroll = domWrapper.scrollTop;   // 已经被卷掉的高度
        const clientHeight = domWrapper.clientHeight; // 容器高度
        const scrollHeight = domWrapper.scrollHeight; // 内容总高度
        if (scrollHeight - 10 > currentScroll + clientHeight) {
            window.requestAnimationFrame(smoothscroll);
            domWrapper.scrollTo(0, currentScroll + (scrollHeight - currentScroll - clientHeight) / 2);
        }
    })();
}

export const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const fileContent = reader.result as string;
            resolve(fileContent);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
};