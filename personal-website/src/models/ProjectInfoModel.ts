export default class ProjectInfoModel
{
    backgroundImageSource: string = "";
    translationKey: string="";
    btnHref: string = "";
    btnRouterLink: string = "";
    downloadWindowsUrl: string = "";
    downloadMacUrl: string = "";
    downloadStatsRepo: string = "";
    docsRouterLink: string = "";
    backgroundSize: string = "cover";
    feedbackUrl: string = "";

    constructor(
        backgroundImageSource: string = "",
        translationKey: string="",
        btnHref: string = "",
        btnRouterLink: string = "",
        downloadWindowsUrl: string = "",
        downloadMacUrl: string = "",
        downloadStatsRepo: string = "",
        docsRouterLink: string = "",
        backgroundSize: string = "cover",
        feedbackUrl: string = "")
    {
        this.backgroundImageSource = backgroundImageSource;
        this.translationKey = translationKey;
        this.btnHref = btnHref;
        this.btnRouterLink = btnRouterLink;
        this.downloadWindowsUrl = downloadWindowsUrl;
        this.downloadMacUrl = downloadMacUrl;
        this.downloadStatsRepo = downloadStatsRepo;
        this.docsRouterLink = docsRouterLink;
        this.backgroundSize = backgroundSize;
        this.feedbackUrl = feedbackUrl;
    }
}
