export class Progress {
  public assets:LoadedAssetsGroup = {}
  public groupStatus:Dictionary<ProgressStatus> = {}
  public loadGroup(assetGroup:AssetGroup, name:string) {
    this.groupStatus[name] = {
      total: 0,
      complete: 0,
      success: 0,
      failed: 0
    }
    if (name !== 'default') this.assets[name] = {}

    for (const key in assetGroup) {
      this.groupStatus[name].total++
      this.loadImage(key, assetGroup[key]).then((data:LoadedImage) => {
        this.groupStatus[name].complete++
        this.groupStatus[name].success++
        if (name === 'default') this.assets[data.name] = data.image
        else (this.assets[name] as LoadedAssets)[data.name] = data.image
        this.callProgress(name, data.name, data.url, data.image)
      }).catch((data) => {
        this.groupStatus[name].complete++
        this.groupStatus[name].failed++
        this.callProgress(name, data.name, data.url)
      })
    }
  }

  private loadImage(name:string, url:string):Promise<LoadedImage> {
    return new Promise((resolve, reject) => {
      const img:HTMLImageElement = document.createElement('img') as HTMLImageElement
      img.onload = () => {
        resolve({
          name,
          url,
          image: img
        })
      }
      img.onerror = () => {
        reject({
          name,
          url,
          image: null
        })
      }
      img.src = url
    })
  }

  public onProgress(groupName:string, assetName:string, url:string, image?:HTMLImageElement) {}
  public onProgressEnd(name:string, status:ProgressStatus) {}

  private callProgress(groupName:string, assetName:string, url:string, image?:HTMLImageElement) {
    if (this.onProgress) this.onProgress(groupName, assetName, url, image)
    if (this.groupStatus[groupName].total === this.groupStatus[groupName].complete) this.callProgressEnd(groupName)
  }

  private callProgressEnd(groupName:string) {
    if (this.onProgressEnd) this.onProgressEnd(groupName, this.groupStatus[groupName])
  }
}
