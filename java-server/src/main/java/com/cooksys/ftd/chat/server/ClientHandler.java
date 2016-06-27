package com.cooksys.ftd.chat.server;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ClientHandler implements Runnable, Closeable {
	
	Logger log = LoggerFactory.getLogger(ClientHandler.class);

	private Socket client;
	private PrintWriter writer;
	private BufferedReader reader;

	public ClientHandler(Socket client, Map<ClientHandler, Thread> handlerThreads) throws IOException {
		super();
		this.client = client;
		this.reader = new BufferedReader(new InputStreamReader(client.getInputStream()));
		this.writer = new PrintWriter(client.getOutputStream(), true);
		log.info(client.getOutputStream().toString());
	}
	
	void sendMessage(String message) {
		writer.print(message);
		writer.flush();
	}

	@Override
	public void run() {
		try {
			log.info("handling client {}", this.client.getRemoteSocketAddress());
			while (!this.client.isClosed()) {
				String echo = reader.readLine();
				// "reader.readLine" receives the message sent by JavaScript's "server.write()"
				log.info("received message [{}] from client {}", echo,
						this.client.getRemoteSocketAddress());
				if(echo == "disconnect") {
					log.info("caught command 'disconnect'");
					this.close();
				} else {
					Server.getMessages().setMesses(echo);
					Server.getMessages().broadcast();
					writer.flush();
				}
			}
			log.info("Client {} closed.", this.client.getRemoteSocketAddress());
			this.close();
		} catch (IOException e) {
			log.error("Handler fail! oh noes :(", e);
		}
	}

	@Override
	public void close() throws IOException {
		log.info("closing connection to client {}", this.client.getRemoteSocketAddress());
		this.client.close();
	}

}
