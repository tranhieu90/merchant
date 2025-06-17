export function generatePassword(length: number = 8): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const digitChars = '0123456789';
  const specialChars = '!@#$%^&*()-_+=[]{}|;:,.<>?';
  const allChars = uppercaseChars + lowercaseChars + digitChars + specialChars;
  let password = '';

  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += digitChars.charAt(Math.floor(Math.random() * digitChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function convertLstAreaByOrder(list: any[], parentId: number | null): any[] {
  let result = list.filter(item => item.parentId === parentId);

  result.forEach(item => {
    let children = convertLstAreaByOrder(list, item.id);
    item.children = children;
  });
  return result;
}
export function fomatAddress(list: string[]):string {
  return list.filter(part => part?.trim())
    .map(part => part.trim())
    .join(', ');
}
export function disableItemsNotAtLevel(list: any[], level: number): any[] {
  return list.map(item => ({
    ...item,
    disabled: item.level !== level
  }));
}
export function setDisableForItemsNotAtLevel(list: any[], level: number, disable: boolean): any {
 return list.forEach(item => {
    if (item.level !== level) {
      item.disabled = disable;
    }
  });
}