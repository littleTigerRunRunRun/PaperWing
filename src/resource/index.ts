import { Progress } from './Progress'
import { isString } from '../utils/index'

export class Resource {
  public get assets():LoadedAssetsGroup { return this.progress.assets }
  private subscriber:PaperWingSubscriber
  constructor(subscriber:PaperWingSubscriber, assets?:Assets) {
    this.progress = new Progress()
    this.progress.onProgress = this.onProgress
    this.progress.onProgressEnd = this.onProgressEnd

    this.subscriber = subscriber

    if (assets) this.load(assets)
  }

  // 加载
  private progress:Progress
  private total:number = 0
  private complete:number = 0
  private success:number = 0
  private failed:number = 0
  public get status():ProgressStatus {
    return {
      total: this.total,
      complete: this.complete,
      success: this.success,
      failed: this.failed
    }
  }
  public load(assets:Assets) {
    this.total = 0
    this.complete = 0
    this.success = 0
    this.failed = 0

    const noGroup:AssetGroup = {}
    for (const key in assets) {
      if (isString(assets[key])) {
        noGroup[key] = assets[key] as string
        this.total++
      } else {
        if (key === 'default') console.error('资源组名不可以为default，已被占用')
        for (const k in assets[key] as AssetGroup) { this.total++ }
        this.progress.loadGroup(assets[key] as AssetGroup, key)
      }
    }

    this.progress.loadGroup(noGroup, 'default')
  }

  private onProgress = (groupName:string, assetName:string, url:string, img?:HTMLImageElement) => {
    if (img) {
      this.success++
      this.subscriber.set(`asset_${groupName}_${assetName}`, img)
    } else this.failed++
    this.complete++

    this.subscriber.broadcast('progress', { groupName, assetName, url, current: this.complete, total: this.total })
  }

  private onProgressEnd = (name:string, status:ProgressStatus) => {
    this.subscriber.broadcast('progressGroupEnd', { name, status, assets: this.assets[name] })
    if (this.total === this.complete) {
      this.subscriber.broadcast('progressEnd', { status: this.status, assets: this.assets })
    }
  }
}