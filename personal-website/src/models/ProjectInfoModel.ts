export default class ProjectInfoModel
{
    backgroundImageSource: string = "";
    translationKey: string="";
    btnHref: string = "";
    btnRouterLink: string = "";
    downloadWindowsUrl: string = "";
    downloadMacUrl: string = "";

    constructor(
        backgroundImageSource: string = "",
        translationKey: string="",
        btnHref: string = "",
        btnRouterLink: string = "",
        downloadWindowsUrl: string = "",
        downloadMacUrl: string = "")
    {
        this.backgroundImageSource = backgroundImageSource;
        this.translationKey = translationKey;
        this.btnHref = btnHref;
        this.btnRouterLink = btnRouterLink;
        this.downloadWindowsUrl = downloadWindowsUrl;
        this.downloadMacUrl = downloadMacUrl;
    }
}