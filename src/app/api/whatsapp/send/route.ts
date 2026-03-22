import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// POST - Send WhatsApp message via wacli
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'to and message are required' },
        { status: 400 }
      );
    }

    // Validate JID format (should be like 123456789@s.whatsapp.net or 123456@lid)
    if (!to.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid JID format. Use format: number@s.whatsapp.net or number@lid' },
        { status: 400 }
      );
    }

    // Escape message for shell
    const escapedMessage = message
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');

    // Execute wacli send command
    const { stdout, stderr } = await execAsync(
      `wacli send text --to "${to}" --message "${escapedMessage}"`,
      { timeout: 30000 }
    );

    // Parse response
    const successMatch = stdout.match(/Sent to .+ \(id (.+)\)/);
    if (successMatch) {
      return NextResponse.json({
        success: true,
        messageId: successMatch[1],
        to,
        message: 'Message sent successfully'
      });
    }

    // Check for errors
    if (stderr.includes('error') || stdout.includes('error')) {
      return NextResponse.json({
        success: false,
        error: stderr || stdout
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      to,
      rawOutput: stdout
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}