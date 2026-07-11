export default class TitleHelper
{
    static BASE_TITLE: string = "Zakary Grand Maison"

    static concat(title: string = "")
    {
        return title + " | " + this.BASE_TITLE;
    }
}