// src/services/emailService.js
import { supabase } from '../supabase';

class EmailService {
  /**
   * Generate a unique verification code for the transaction
   * Format: LAND-XXXX-XXXX (e.g., LAND-A7B2-K9M4)
   */
  generateVerificationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = Array.from({ length: 4 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    const part2 = Array.from({ length: 4 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    
    return `LAND-${part1}-${part2}`;
  }

  /**
   * Send email notification when auction ends
   * Sends to both owner and winner with verification code
   */
  async sendAuctionEndNotification(auctionData, winnerData) {
    let ownerEmailSent = false;
    let winnerEmailSent = false;
    let verificationCode = null;

    try {
      console.log('═══════════════════════════════════════');
      console.log('📧 STARTING EMAIL NOTIFICATION PROCESS');
      console.log('═══════════════════════════════════════');
      
      console.log('📊 AUCTION DATA:', {
        id: auctionData.id,
        title: auctionData.title,
        ownerName: auctionData.ownerName,
        ownerEmail: auctionData.ownerEmail,
        ownerId: auctionData.ownerId
      });
      
      console.log('🏆 WINNER DATA:', {
        bidderName: winnerData.bidderName,
        bidderEmail: winnerData.bidderEmail,
        bidderId: winnerData.bidderId,
        amount: winnerData.amount
      });

      // Validate data before proceeding
      if (!auctionData.ownerEmail) {
        throw new Error('❌ CRITICAL: Owner email is missing!');
      }
      if (!winnerData.bidderEmail) {
        throw new Error('❌ CRITICAL: Winner email is missing!');
      }
      
      // Generate unique verification code
      verificationCode = this.generateVerificationCode();
      console.log('🔐 Generated verification code:', verificationCode);
      
      // Store verification code in database FIRST
      console.log('💾 Storing verification code in database...');
      await this.storeVerificationCode(
        auctionData.id,
        verificationCode,
        auctionData.ownerId,
        winnerData.bidderId
      );
      console.log('✅ Verification code stored successfully');

      console.log('═══════════════════════════════════════');
      console.log('📤 STEP 1: SENDING EMAIL TO OWNER');
      console.log('═══════════════════════════════════════');
      console.log('👤 Owner Email:', auctionData.ownerEmail);
      
      try {
        const ownerResult = await this.sendEmailToOwner({
          ownerEmail: auctionData.ownerEmail,
          ownerName: auctionData.ownerName,
          landTitle: auctionData.title,
          landLocation: auctionData.location,
          landArea: auctionData.area,
          winnerName: winnerData.bidderName,
          winnerEmail: winnerData.bidderEmail,
          winningBid: winnerData.amount,
          verificationCode: verificationCode,
          auctionId: auctionData.id
        });
        ownerEmailSent = true;
        console.log('✅ OWNER EMAIL SENT SUCCESSFULLY!');
        console.log('📬 Owner Response:', ownerResult);
      } catch (ownerError) {
        console.error('❌ OWNER EMAIL FAILED:', ownerError);
        console.error('❌ Owner Error Details:', {
          message: ownerError.message,
          stack: ownerError.stack
        });
        // Continue to try winner email even if owner fails
      }

      console.log('═══════════════════════════════════════');
      console.log('📤 STEP 2: SENDING EMAIL TO WINNER');
      console.log('═══════════════════════════════════════');
      console.log('🏆 Winner Email:', winnerData.bidderEmail);
      
      try {
        const winnerResult = await this.sendEmailToWinner({
          winnerEmail: winnerData.bidderEmail,
          winnerName: winnerData.bidderName,
          landTitle: auctionData.title,
          landLocation: auctionData.location,
          landArea: auctionData.area,
          ownerName: auctionData.ownerName,
          ownerEmail: auctionData.ownerEmail,
          winningBid: winnerData.amount,
          verificationCode: verificationCode,
          auctionId: auctionData.id
        });
        winnerEmailSent = true;
        console.log('✅ WINNER EMAIL SENT SUCCESSFULLY!');
        console.log('📬 Winner Response:', winnerResult);
      } catch (winnerError) {
        console.error('❌ WINNER EMAIL FAILED:', winnerError);
        console.error('❌ Winner Error Details:', {
          message: winnerError.message,
          stack: winnerError.stack
        });
      }

      console.log('═══════════════════════════════════════');
      console.log('📊 FINAL RESULTS:');
      console.log('═══════════════════════════════════════');
      console.log('Owner Email Sent:', ownerEmailSent ? '✅ YES' : '❌ NO');
      console.log('Winner Email Sent:', winnerEmailSent ? '✅ YES' : '❌ NO');
      console.log('Verification Code:', verificationCode);

      if (!ownerEmailSent && !winnerEmailSent) {
        throw new Error('Both emails failed to send!');
      }

      if (!ownerEmailSent || !winnerEmailSent) {
        const failedParty = !ownerEmailSent ? 'Owner' : 'Winner';
        console.warn(`⚠️ WARNING: ${failedParty} email failed, but verification stored`);
      }

      return { 
        success: true, 
        verificationCode,
        ownerEmailSent,
        winnerEmailSent
      };
    } catch (error) {
      console.error('═══════════════════════════════════════');
      console.error('❌ CRITICAL ERROR IN EMAIL PROCESS');
      console.error('═══════════════════════════════════════');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Store verification code in database
   */
  async storeVerificationCode(auctionId, code, ownerId, winnerId) {
    try {
      const { data, error } = await supabase
        .from('auction_verifications')
        .insert([{
          auction_id: auctionId,
          verification_code: code,
          owner_id: ownerId,
          winner_id: winnerId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Verification stored:', data);
      return data;
    } catch (error) {
      console.error('❌ Error storing verification code:', error);
      throw error;
    }
  }

  /**
   * Send email to auction owner
   */
  async sendEmailToOwner(data) {
    try {
      console.log('🔧 Building owner email...');
      
      const emailContent = {
        to: data.ownerEmail,
        subject: `🎉 Your Auction Has Ended - Winner Announced!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 2px solid #10b981; border-top: none; border-radius: 0 0 10px 10px; }
              .code-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
              .code { font-size: 32px; font-weight: bold; color: #92400e; letter-spacing: 3px; font-family: 'Courier New', monospace; }
              .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
              .info-label { font-weight: bold; color: #059669; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏆 Congratulations!</h1>
                <p>Your Land Auction Has Successfully Ended</p>
              </div>
              <div class="content">
                <h2>Hello ${data.ownerName}!</h2>
                <p>Great news! Your land auction has ended successfully with a winning bid.</p>
                
                <div class="code-box">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">🔐 VERIFICATION CODE</p>
                  <div class="code">${data.verificationCode}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">Share this code with the winner during transaction</p>
                </div>

                <h3>📋 Auction Details:</h3>
                <div class="info-box">
                  <p><span class="info-label">Land Title:</span> ${data.landTitle}</p>
                  <p><span class="info-label">Location:</span> ${data.landLocation}</p>
                  <p><span class="info-label">Area:</span> ${data.landArea}</p>
                  <p><span class="info-label">Winning Bid:</span> Rs ${data.winningBid.toLocaleString()}</p>
                </div>

                <h3>👤 Winner Information:</h3>
                <div class="info-box">
                  <p><span class="info-label">Name:</span> ${data.winnerName}</p>
                  <p><span class="info-label">Email:</span> ${data.winnerEmail}</p>
                </div>

                <h3>📞 Next Steps:</h3>
                <ol>
                  <li>Contact the winner using the email provided above</li>
                  <li>Arrange a meeting to discuss payment and property transfer</li>
                  <li><strong>Verify the verification code</strong> with the winner before proceeding</li>
                  <li>Complete the legal documentation and registration</li>
                </ol>

                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0;"><strong>⚠️ Important Security Note:</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Always verify the verification code (<strong>${data.verificationCode}</strong>) with the winner before proceeding with any transaction.</p>
                </div>

                <p>Best regards,<br><strong>Land Bidding Platform Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; 2024 Land Bidding Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('📧 Calling edge function for OWNER email...');
      console.log('📧 Recipient:', emailContent.to);
      
      const result = await this.sendEmail(emailContent);
      
      console.log('✅ Owner email successfully sent via edge function');
      return result;
    } catch (error) {
      console.error('❌ Error in sendEmailToOwner:', error);
      throw error;
    }
  }

  /**
   * Send email to auction winner
   */
  async sendEmailToWinner(data) {
    try {
      console.log('🔧 Building winner email...');
      
      const emailContent = {
        to: data.winnerEmail,
        subject: `🎊 Congratulations! You Won the Land Auction`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 2px solid #10b981; border-top: none; border-radius: 0 0 10px 10px; }
              .code-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
              .code { font-size: 32px; font-weight: bold; color: #92400e; letter-spacing: 3px; font-family: 'Courier New', monospace; }
              .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
              .info-label { font-weight: bold; color: #059669; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p>You Won the Land Auction</p>
              </div>
              <div class="content">
                <h2>Hello ${data.winnerName}!</h2>
                <p>Fantastic news! You have won the land auction with your winning bid.</p>
                
                <div class="code-box">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">🔐 YOUR VERIFICATION CODE</p>
                  <div class="code">${data.verificationCode}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">Save this code - you'll need it when meeting the owner</p>
                </div>

                <h3>📋 Property Details:</h3>
                <div class="info-box">
                  <p><span class="info-label">Land Title:</span> ${data.landTitle}</p>
                  <p><span class="info-label">Location:</span> ${data.landLocation}</p>
                  <p><span class="info-label">Area:</span> ${data.landArea}</p>
                  <p><span class="info-label">Your Winning Bid:</span> Rs ${data.winningBid.toLocaleString()}</p>
                </div>

                <h3>👤 Owner Information:</h3>
                <div class="info-box">
                  <p><span class="info-label">Name:</span> ${data.ownerName}</p>
                  <p><span class="info-label">Email:</span> ${data.ownerEmail}</p>
                </div>

                <h3>📞 Next Steps:</h3>
                <ol>
                  <li>Contact the property owner using the email provided above</li>
                  <li>Schedule a meeting to view the property and discuss terms</li>
                  <li><strong>Share your verification code (${data.verificationCode})</strong> with the owner to confirm your identity</li>
                  <li>Arrange payment and complete legal documentation</li>
                  <li>Transfer ownership through proper legal channels</li>
                </ol>

                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0;"><strong>⚠️ Important Security Note:</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">The owner will ask for your verification code (<strong>${data.verificationCode}</strong>) to confirm you are the legitimate winner. Never share this code with anyone else.</p>
                </div>

                <div style="background: #dcfce7; border: 2px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0;"><strong>💡 Tips for Safe Transaction:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                    <li>Meet in a public place for the first meeting</li>
                    <li>Verify all property documents with a lawyer</li>
                    <li>Use secure payment methods</li>
                    <li>Get everything in writing</li>
                    <li>Complete registration through proper legal channels</li>
                  </ul>
                </div>

                <p>Best regards,<br><strong>Land Bidding Platform Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; 2024 Land Bidding Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('📧 Calling edge function for WINNER email...');
      console.log('📧 Recipient:', emailContent.to);
      
      const result = await this.sendEmail(emailContent);
      
      console.log('✅ Winner email successfully sent via edge function');
      return result;
    } catch (error) {
      console.error('❌ Error in sendEmailToWinner:', error);
      throw error;
    }
  }

  /**
   * Core email sending function using Supabase Edge Function
   */
  async sendEmail(emailData) {
    try {
      console.log('📨 Invoking Supabase edge function...');
      console.log('📨 Email to:', emailData.to);
      console.log('📨 Subject:', emailData.subject);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('❌ Edge function returned error:', error);
        throw error;
      }
      
      console.log('✅ Edge function executed successfully');
      console.log('📬 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error invoking edge function:', error);
      throw error;
    }
  }

  /**
   * Send contact message to rental/product owner - NEW METHOD
   */
  async sendRentalMessage(messageData) {
    try {
      console.log('═══════════════════════════════════════');
      console.log('📧 SENDING RENTAL MESSAGE');
      console.log('═══════════════════════════════════════');
      console.log('📊 Message data:', messageData);

      // Validate data
      if (!messageData.ownerEmail) {
        throw new Error('❌ Owner email is missing!');
      }
      if (!messageData.senderName || !messageData.senderPhone || !messageData.message) {
        throw new Error('❌ Sender information is incomplete!');
      }

      const emailContent = {
        to: messageData.ownerEmail,
        subject: `📩 New Inquiry About Your ${messageData.productType}: ${messageData.productName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 2px solid #10b981; border-top: none; border-radius: 0 0 10px 10px; }
              .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
              .info-label { font-weight: bold; color: #059669; }
              .message-box { background: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📩 New Inquiry Received</h1>
                <p>Someone is interested in your ${messageData.productType}</p>
              </div>
              <div class="content">
                <h2>Hello ${messageData.ownerName}!</h2>
                <p>You have received a new inquiry about your ${messageData.productType}.</p>

                <h3>📋 ${messageData.productType} Details:</h3>
                <div class="info-box">
                  <p><span class="info-label">Title:</span> ${messageData.productName}</p>
                  ${messageData.category ? `<p><span class="info-label">Category:</span> ${messageData.category}</p>` : ''}
                  ${messageData.location ? `<p><span class="info-label">Location:</span> ${messageData.location}</p>` : ''}
                  ${messageData.price ? `<p><span class="info-label">Price:</span> Rs ${messageData.price.toLocaleString()}${messageData.productType === 'Rental' ? '/day' : ''}</p>` : ''}
                </div>

                <h3>👤 Contact Information:</h3>
                <div class="info-box">
                  <p><span class="info-label">Name:</span> ${messageData.senderName}</p>
                  <p><span class="info-label">Phone:</span> ${messageData.senderPhone}</p>
                </div>

                <h3>💬 Message:</h3>
                <div class="message-box">
                  <p style="margin: 0; white-space: pre-wrap;">${messageData.message}</p>
                </div>

                <h3>📞 Next Steps:</h3>
                <ol>
                  <li>Contact <strong>${messageData.senderName}</strong> at <strong>${messageData.senderPhone}</strong></li>
                  <li>Discuss the details and answer any questions they have</li>
                  <li>Arrange a meeting or transaction if both parties agree</li>
                </ol>

                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0;"><strong>💡 Tip:</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Respond quickly to interested customers to increase your chances of completing the transaction.</p>
                </div>

                <p>Best regards,<br><strong>Land Bidding Platform Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email notification.</p>
                <p>&copy; 2024 Land Bidding Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('📤 Sending email to:', emailContent.to);
      const result = await this.sendEmail(emailContent);
      
      console.log('✅ Rental message email sent successfully');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error sending rental message:', error);
      throw error;
    }
  }

  /**
 * Send feedback email to website owner
 */
async sendFeedbackEmail(feedbackData) {
  try {
    console.log('═══════════════════════════════════════');
    console.log('📧 SENDING FEEDBACK EMAIL');
    console.log('═══════════════════════════════════════');
    console.log('📊 Feedback data:', feedbackData);

    const emailContent = {
      to: feedbackData.ownerEmail,
      subject: `📩 New Feedback from ${feedbackData.senderName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 2px solid #10b981; border-top: none; border-radius: 0 0 10px 10px; }
            .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
            .message-box { background: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 New Feedback Received</h1>
              <p>User feedback from your platform</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have received new feedback from a user on your platform.</p>

              <h3>👤 User Information:</h3>
              <div class="info-box">
                <p><strong>Name:</strong> ${feedbackData.senderName}</p>
                ${feedbackData.hasScreenshot ? '<p><strong>Screenshot:</strong> Attached (check Firebase)</p>' : ''}
              </div>

              <h3>💬 Feedback Message:</h3>
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${feedbackData.message}</p>
              </div>

              <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>💡 Action Required:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Review this feedback and take appropriate action to improve your platform.</p>
              </div>

              <p>Best regards,<br><strong>Land Bidding Platform System</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email notification.</p>
              <p>&copy; 2024 Land Bidding Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('📤 Sending feedback email to:', emailContent.to);
    const result = await this.sendEmail(emailContent);
    console.log('✅ Feedback email sent successfully');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error sending feedback email:', error);
    throw error;
  }
}

/**
 * Send rating email to website owner
 */
async sendRatingEmail(ratingData) {
  try {
    console.log('═══════════════════════════════════════');
    console.log('📧 SENDING RATING EMAIL');
    console.log('═══════════════════════════════════════');
    console.log('📊 Rating data:', ratingData);

    const stars = '⭐'.repeat(ratingData.rating);
    
    const emailContent = {
      to: ratingData.ownerEmail,
      subject: `⭐ New ${ratingData.rating}-Star Rating Received!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 2px solid #10b981; border-top: none; border-radius: 0 0 10px 10px; }
            .rating-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
            .stars { font-size: 48px; margin: 10px 0; }
            .message-box { background: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ New Rating Received!</h1>
              <p>A user has rated your platform</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>Great news! A user has shared their rating of your platform.</p>

              <div class="rating-box">
                <p style="margin: 0; font-size: 14px; color: #92400e;">USER RATING</p>
                <div class="stars">${stars}</div>
                <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #92400e;">${ratingData.rating} out of 5 stars</p>
              </div>

              ${ratingData.message ? `
                <h3>💬 Additional Comments:</h3>
                <div class="message-box">
                  <p style="margin: 0; white-space: pre-wrap;">${ratingData.message}</p>
                </div>
              ` : ''}

              <div style="background: #dcfce7; border: 2px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>💡 Keep Up the Good Work!</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">User ratings help you understand how well your platform is performing.</p>
              </div>

              <p>Best regards,<br><strong>Land Bidding Platform System</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email notification.</p>
              <p>&copy; 2024 Land Bidding Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('📤 Sending rating email to:', emailContent.to);
    const result = await this.sendEmail(emailContent);
    console.log('✅ Rating email sent successfully');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error sending rating email:', error);
    throw error;
  }
}

  /**
   * Check if auction has ended and send notifications
   */
  async checkAndNotifyAuctionEnd(auction) {
    try {
      const now = new Date();
      const endDate = new Date(auction.endDate);
      
      console.log('🔍 Checking auction end status:', {
        auctionId: auction.id,
        title: auction.title,
        now: now.toISOString(),
        endDate: endDate.toISOString(),
        hasEnded: now >= endDate,
        bidsCount: auction.bids?.length || 0
      });
      
      if (now >= endDate && auction.bids && auction.bids.length > 0) {
        
        console.log('✅ Auction has ended with bids');
        
        const { data: existingVerification, error: checkError } = await supabase
          .from('auction_verifications')
          .select('*')
          .eq('auction_id', auction.id)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking verification:', checkError);
          throw checkError;
        }

        if (existingVerification) {
          console.log('⚠️ Emails already sent on:', existingVerification.created_at);
          return { 
            notificationSent: false, 
            alreadySent: true, 
            verificationCode: existingVerification.verification_code 
          };
        }

        console.log('📧 No previous emails found, proceeding...');

        const highestBid = auction.bids.reduce((prev, current) =>
          prev.amount > current.amount ? prev : current
        );

        console.log('🏆 Winner identified:', {
          bidderName: highestBid.bidderName,
          bidderEmail: highestBid.bidderEmail,
          amount: highestBid.amount
        });

        if (!auction.ownerEmail) {
          console.error('❌ Owner email missing');
          alert('❌ Cannot send emails: Owner email is missing!');
          return { notificationSent: false, error: 'Owner email missing' };
        }

        if (!highestBid.bidderEmail) {
          console.error('❌ Winner email missing');
          alert('❌ Cannot send emails: Winner email is missing!');
          return { notificationSent: false, error: 'Winner email missing' };
        }

        console.log('✅ All data validated, sending emails to BOTH parties...');

        const result = await this.sendAuctionEndNotification(auction, highestBid);
        
        await supabase
          .from('biddings')
          .update({ status: 'ended' })
          .eq('id', auction.id);

        const message = result.ownerEmailSent && result.winnerEmailSent
          ? '✅ SUCCESS! Emails sent to BOTH owner and winner!'
          : result.ownerEmailSent
          ? '⚠️ Owner email sent, but winner email failed!'
          : result.winnerEmailSent
          ? '⚠️ Winner email sent, but owner email failed!'
          : '❌ Both emails failed!';

        alert(message + '\n\nOwner: ' + auction.ownerEmail + '\nWinner: ' + highestBid.bidderEmail + '\nCode: ' + result.verificationCode);
        
        return { 
          notificationSent: true, 
          verificationCode: result.verificationCode,
          ownerEmailSent: result.ownerEmailSent,
          winnerEmailSent: result.winnerEmailSent
        };
      }
      
      console.log('⏳ Auction not yet ended or no bids');
      return { notificationSent: false };
    } catch (error) {
      console.error('❌ Error in checkAndNotifyAuctionEnd:', error);
      alert('❌ Error: ' + error.message);
      return { notificationSent: false, error };
    }
  }
}

export default new EmailService();