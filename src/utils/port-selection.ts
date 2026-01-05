/**
 * Port selection utilities for the dashboard server
 */

export interface PortSelectionOptions {
	hostname: string;
	fetch: (req: Request) => Promise<Response>;
}

export interface PortSelectionResult {
	server: ReturnType<typeof Bun.serve>;
	port: number;
	usedFallback: boolean;
}

/**
 * Checks if an error indicates that a port is in use
 */
export function isPortInUseError(error: unknown): boolean {
	const errorObj = error as Error & { code?: string };
	const message = String(error);
	return (
		errorObj.code === "EADDRINUSE" ||
		message.includes("EADDRINUSE") ||
		message.includes("address already in use") ||
		(message.includes("port") && message.includes("in use"))
	);
}

/**
 * Attempts to start a server on the preferred port, falling back to other ports if needed.
 * Tries up to 100 ports starting from startPort + 1 if the preferred port is in use.
 *
 * @param startPort - The preferred port to use
 * @param options - Server configuration options
 * @returns Server instance and information about which port was used
 */
export function serveWithFallbackPort(
	startPort: number,
	options: PortSelectionOptions,
): PortSelectionResult {
	const { hostname, fetch } = options;

	try {
		const server = Bun.serve({ hostname, port: startPort, fetch });
		return {
			server,
			port: server.port ?? startPort,
			usedFallback: false,
		};
	} catch (error) {
		if (!isPortInUseError(error)) {
			throw error;
		}

		// Try to find an available port
		for (let port = startPort + 1; port < startPort + 100; port++) {
			try {
				const server = Bun.serve({ hostname, port, fetch });
				return {
					server,
					port: server.port ?? port,
					usedFallback: true,
				};
			} catch (err) {
				if (isPortInUseError(err)) {
					continue;
				}
				throw err;
			}
		}

		// Fallback to OS-assigned port if we can't find one in range
		const server = Bun.serve({ hostname, port: 0, fetch });
		return {
			server,
			port: server.port ?? 0,
			usedFallback: true,
		};
	}
}
