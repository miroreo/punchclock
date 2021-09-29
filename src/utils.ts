export const genUUID = (): string => {
	return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(/x/g,_=>(Math.random()*16|0).toString(16));
}