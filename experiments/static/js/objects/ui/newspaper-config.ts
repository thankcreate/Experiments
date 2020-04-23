interface NewspaperPropInfo {
    type: NewspaperPropType,    
    icon: string,
    desc: string,
    activated: boolean
}

enum NewspaperPropType {
    LessCleaningTime,
    SeeNoEvil,
    AutoLabel,
    Prompt,
    AutoEmotion,
}

let newspaperPropInfos : NewspaperPropInfo[] = [
    {type: NewspaperPropType.LessCleaningTime, icon: '⏳', desc: '', activated: false},
    {type: NewspaperPropType.SeeNoEvil, icon: '🙈', desc: '',activated: false},
    {type: NewspaperPropType.AutoLabel,icon: '🏷️', desc: '', activated: false},
    {type: NewspaperPropType.Prompt, icon: '💡', desc: '', activated: false},
    {type: NewspaperPropType.AutoEmotion,icon: '🤯', desc: '', activated: false},
]