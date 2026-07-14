import shutil
import os

src = "."
dst = "_deploy_staging"

# Remove destination if exists
if os.path.exists(dst):
    shutil.rmtree(dst)

# Copy everything except vendor/ffmpeg
def ignore_func(directory, files):
    ignored = []
    for f in files:
        if f == "ffmpeg" and "vendor" in directory:
            ignored.append(f)
    return ignored

shutil.copytree(src, dst, ignore=ignore_func)

print(f"Copied to {dst}, excluding vendor/ffmpeg")