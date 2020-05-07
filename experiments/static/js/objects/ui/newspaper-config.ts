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
    {type: NewspaperPropType.SeeNoEvil, icon: '🙈', desc: 'Yellow bar on your eyes',activated: false},
    {type: NewspaperPropType.LessCleaningTime, icon: '🧹', desc: 'Faster purging speed', activated: false},    
    {type: NewspaperPropType.Prompt, icon: '💡', desc: 'Emotion suggestion', activated: false},
    {type: NewspaperPropType.AutoLabel,icon: '🏷️', desc: 'Auto drag and drop', activated: false},
    {type: NewspaperPropType.AutoEmotion,icon: '🤯', desc: 'Auto expression', activated: false},
]