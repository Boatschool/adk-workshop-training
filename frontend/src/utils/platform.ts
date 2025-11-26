/**
 * Platform Detection Utilities
 * Detect user's operating system and provide platform-specific instructions
 */

export type Platform = 'macos' | 'windows' | 'linux' | 'unknown'

/**
 * Detect the user's platform based on user agent
 */
export function detectPlatform(): Platform {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform?.toLowerCase() || ''

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'macos'
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows'
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux'
  }
  return 'unknown'
}

/**
 * Get platform-specific display name
 */
export function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    macos: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    unknown: 'Unknown',
  }
  return names[platform]
}

/**
 * Get platform icon emoji
 */
export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    macos: '🍎',
    windows: '🪟',
    linux: '🐧',
    unknown: '💻',
  }
  return icons[platform]
}

/**
 * Get Python command for platform
 */
export function getPythonCommand(platform: Platform): string {
  if (platform === 'windows') {
    return 'python'
  }
  return 'python3'
}

/**
 * Get virtual environment activation command
 */
export function getVenvActivateCommand(platform: Platform, venvPath: string = '~/adk-workshop'): string {
  if (platform === 'windows') {
    return `${venvPath}\\Scripts\\activate`
  }
  return `source ${venvPath}/bin/activate`
}

/**
 * Get shell type based on platform
 */
export function getShellType(platform: Platform): string {
  if (platform === 'windows') {
    return 'PowerShell or Command Prompt'
  }
  if (platform === 'macos') {
    return 'Terminal (zsh or bash)'
  }
  return 'Terminal (bash)'
}
