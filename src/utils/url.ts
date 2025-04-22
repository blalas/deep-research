export function completePath(url: string, newPath?: string) {
  try {
    // 处理以#结尾的URL，直接返回URL本身，不添加任何路径
    if (url.endsWith('#')) {
      const cleanUrl = url.substring(0, url.length - 1); // 去掉结尾的#字符
      // 控制台输出使用的API端口
      console.log('Using API endpoint directly:', cleanUrl);
      return cleanUrl;
    }

    const urlObj = new URL(url);
    let pathname = urlObj.pathname;

    // Remove the trailing slash if present
    if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // Extract the end path
    const paths = pathname.split("/");
    const endPath = paths.pop() || "";
    // Determine whether a version number exists
    const versionMatch = endPath.match(/^v\d+/);
    if (versionMatch) {
      urlObj.pathname = pathname;
      return urlObj.toString();
    }

    // Check if it ends with the target path
    if (newPath && !pathname.endsWith(newPath)) {
      pathname += newPath;
    }

    if (pathname === "") {
      return urlObj.origin;
    }

    // Update pathname
    urlObj.pathname = pathname;
    return urlObj.toString();
  } catch (err) {
    console.error("Invalid URL:", err);
    return url;
  }
}
