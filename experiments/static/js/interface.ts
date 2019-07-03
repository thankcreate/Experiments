enum ErrorInputCode {
    NoError,
    Same,
    Contain,
    Wrap,
    TooShort,
    Repeat,
    NotWord
}

interface ErrorInput {
    code: ErrorInputCode,
    enemyName: string
}

interface SimResultItem {
    name: string,
    value: number
}

interface SimResult {
    input: string,
    array: string[],
    outputArray: SimResultItem[]
}

interface TextStyle{
    fontSize: string,
    fill: string,
    fontFamily: string,
}
